import Stripe from "stripe";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import config from "../../../config";
import { PaymentStatus, UserRole } from "@prisma/client";
import { TStripeSaveWithCustomerInfo } from "./StripePayment.interface";

const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
  apiVersion: '2024-06-20',
});


// Step 1: Create a Customer and Save the Card
const saveCardWithCustomerInfoIntoStripe = async (
  payload: TStripeSaveWithCustomerInfo,
  userId: string
) => {
  try {
    const { paymentMethodId, address } = payload;

    const user = await prisma.user.findUnique({
      where:{ id : userId},
      select:{
        fullName: true,
        email: true
      }
    })

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      name: user.fullName || 'No Name',
      email: user.email,
      address: {
        city: address.city,
        postal_code: address.postal_code,
        country: address.country,
      },
    });

    // Attach PaymentMethod to the Customer
    const attach = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set PaymentMethod as Default
    const updateCustomer = await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // update profile with customerId
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        customerId: customer.id,
      },
    });

    return {
      customerId: customer.id,
      paymentMethodId: paymentMethodId,
    };
  } catch (error: any) {
    throw Error(error.message);
  }
};

// Step 2: Create and Confirm Payment Intent with Offer Handling
const authorizedPaymentWithSaveCardFromStripe = async (
  userId: string,
  payload: {
    offerId: string;
    paymentMethodId: string;
  }
) => {
  const { offerId, paymentMethodId } = payload;

  // Retrieve the user details from the database
  const userDetails = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  // Retrieve offer details
  const offerDetails = await prisma.offerDetails.findFirstOrThrow({
    where: { id: offerId, senderId: userId },
    select: { amount: true, senderId: true, receiverId: true },
  });

  if (!offerDetails || offerDetails.amount <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid payment amount");
  }

  const { amount, senderId, receiverId } = offerDetails;

 // Retrieve app fee percentage from environment variables
 const appFeePercentage = parseFloat(process.env.APP_FEE_PERCENTAGE || "2.99");

 if (isNaN(appFeePercentage) || appFeePercentage <= 0) {
   throw new ApiError(
     httpStatus.INTERNAL_SERVER_ERROR,
     "Invalid platform fee configuration. Please contact support."
   );
 }

 const appFee = (amount * appFeePercentage) / 100; // Calculate the platform fee
  const totalAmount = Math.round((amount + appFee) * 100); // Convert to cents

  // Retrieve sender and receiver details
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { stripeAccountID: true, customerId: true },
  });

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { stripeAccountID: true },
  });

  if (!sender?.stripeAccountID || !receiver?.stripeAccountID) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Sender or receiver details not found"
    );
  }

  // Retrieve receiver account details from Stripe
  const receiverAccount = await stripe.accounts.retrieve(receiver.stripeAccountID);

  // Check if the receiver account has the required capabilities for transfers
  if (receiverAccount.capabilities?.transfers !== 'active') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Receiver account does not have the required capabilities for transfers. Please contact support."
    );
  }

  // Create a PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: "usd",
    customer: sender.customerId || undefined,
    payment_method: paymentMethodId,
    confirm: true,
    capture_method: "manual",
    transfer_data: {
      destination: receiver.stripeAccountID,
    },
    application_fee_amount: Math.round(appFee * 100),
    metadata: {
      offerId,
      senderId,
      receiverId,
    },
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never', // Ensure redirects are disabled
    },
  });

  if (paymentIntent.status === "requires_capture") {
    // Save payment details in the database
    const payment = await prisma.payment.create({
      data: {
        paymentId: paymentIntent.id,
        offerId,
        senderId,
        receiverId,
        paymentAmount: amount,
        platformFee: appFee,
        status: "PENDING",
      },
    });

    if (!payment) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Failed to save payment information"
      );
    }
  }

  return paymentIntent;
};



// Step 3: Capture Payment Intent
const capturePayment = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    // Update payment status in the Payment model
    const payment = await prisma.payment.findFirst({
      where:{paymentId: paymentIntentId},
      select:{
        id: true,
        status: true,
        offerId: true
      }
    })
    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    }
    const offer = await prisma.offerDetails.findFirst({
      where:{id : payment.offerId},
      select:{
        id: true,
        status: true,
      }
    })
    if (offer?.status === "COMPLETED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      });
    }

    return paymentIntent;
  } catch (error: any) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
};

// Step 4: Refund Payment
const refundPayment = async (paymentIntentId: string) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // Update payment status in the Payment model
    const payment = await prisma.payment.findFirst({
      where:{paymentId: paymentIntentId},
      select:{
        id: true,
        status: true
      }
    })
    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    }
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' as PaymentStatus },
    });

    return refund;
  } catch (error: any) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
};


// Step 5: Create Stripe Connect Account
const createAccountIntoStripe = async (userId: string) => {
  try {
    // Find user by ID
    const userData = await prisma.user.findUnique({
      where: { id: userId }, // Pass userId directly as a string
    });

    if (!userData) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    if (userData.accountLink && userData.stripeAccountID) {
      const stripeAccountId = userData.stripeAccountID;
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${process.env.FRONTEND_BASE_URL}/reauthenticate`,
        return_url: `${process.env.FRONTEND_BASE_URL}/onboarding-success`,
        type: "account_onboarding",
      });

      await prisma.user.update({
        where: { id: userData.id },
        data: {
          accountLink: accountLink.url,
          stripeAccountID: stripeAccountId,
        },
      });

      return accountLink;
    }

    // Create a new Stripe account
    const account = await stripe.accounts.create({
      type: "express",
      email: userData.email,
      metadata: {
        userId: userData.id,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Generate an account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_BASE_URL}/reauthenticate`,
      return_url: `${process.env.FRONTEND_BASE_URL}/onboarding-success`,
      type: "account_onboarding",
    });

    const stripeAccountId = account.id;

    // Save both Stripe customerId and accountId in the database
    const updateUser = await prisma.user.update({
      where: { id: userData.id },
      data: {
        accountLink: accountLink.url,
        stripeAccountID: stripeAccountId,
      },
    });

    if (!updateUser) {
      throw new ApiError(httpStatus.CONFLICT, "Failed to save account details");
    }

    return accountLink;
  } catch (error: any) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
};


//
// New Route: Save a New Card for Existing Customer
const saveNewCardWithExistingCustomerIntoStripe = async (payload: {
  customerId: string;
  paymentMethodId: string;
}) => {
  try {
    const { customerId, paymentMethodId } = payload;

    // Attach the new PaymentMethod to the existing Customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Optionally, set the new PaymentMethod as the default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return {
      customerId: customerId,
      paymentMethodId: paymentMethodId,
    };
  } catch (error: any) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
};
// Step 6: Get Customer's Saved Cards
const getCustomerSavedCards = async (customerId: string) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  } catch (error: any) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
};

// Step 7: Detach a Card
const deleteCardFromCustomer = async (paymentMethodId: string) => {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    return { message: 'Card deleted successfully' };
  } catch (error: any) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
};

export const StripeService = {
  saveCardWithCustomerInfoIntoStripe,
  authorizedPaymentWithSaveCardFromStripe,
  capturePayment,
  refundPayment,
  createAccountIntoStripe,
  saveNewCardWithExistingCustomerIntoStripe,
  getCustomerSavedCards,
  deleteCardFromCustomer,
};



