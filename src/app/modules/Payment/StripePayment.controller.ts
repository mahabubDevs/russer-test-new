// StripePayment.controller: Module file for the StripePayment.controller functionality.
import { Request, Response, NextFunction, response } from "express";
import { StripeService } from "./StripePayment.service";
import httpStatus from "http-status";
//import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";
import Stripe from "stripe";
import { config } from "dotenv";
import prisma from "../../../shared/prisma";


// saveCardWithCustomer
const saveCardWithCustomer = catchAsync(async(req: Request, res: Response)=>{
      const userId = req.user?.id;
      const result = await StripeService.saveCardWithCustomerInfoIntoStripe(req.body, userId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "card saved successfully!",
        data: result,
      });
})


//authorizePayment
const authorizePayment = catchAsync(async(req: Request, res: Response)=>{
  const userId = req.user?.id;
      const { offerId, paymentMethodId } = req.body;
      const result = await StripeService.authorizedPaymentWithSaveCardFromStripe(userId, { offerId, paymentMethodId });

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "payment authorized successfully!",
        data: result,
      });
})

//capturePayment
const capturePayment = catchAsync(async(req: Request, res: Response)=>{
  const { paymentIntentId } = req.params;
  const result = await StripeService.capturePayment(paymentIntentId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "payment Captured successfully!",
        data: result,
      });
})

//refundPayment
const refundPayment = catchAsync(async(req: Request, res: Response)=>{
  const { paymentIntentId } = req.params;
  const result = await StripeService.refundPayment(paymentIntentId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "payment refund successfully!",
        data: result,
      });
})

//createStripeAccount
const createStripeAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id; // Ensure you're passing only the user ID
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required");
  }

  const result = await StripeService.createAccountIntoStripe(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe account successfully created!",
    data: result,
  });
});

//saveNewCard
const saveNewCard = catchAsync(async(req: Request, res: Response)=>{
  const { customerId, paymentMethodId } = req.body;
  const result = await StripeService.saveNewCardWithExistingCustomerIntoStripe({ customerId, paymentMethodId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New card saved successfully!",
    data: result,
  });
})

//getSavedCards
const getSavedCards = catchAsync(async(req: Request, res: Response)=>{
  const { customerId } = req.params;
      const result = await StripeService.getCustomerSavedCards(customerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "cards retrieve successfully!",
    data: result,
  });
})

//deleteCard
const deleteCard = catchAsync(async(req: Request, res: Response)=>{
  const { paymentMethodId } = req.params;
      const result = await StripeService.deleteCardFromCustomer(paymentMethodId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "card deleted successfully!",
    data: result,
  });
})


//webhook
const handleWebHook = catchAsync( async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'] as string;
  console.log(sig);

  if (!sig) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Missing Stripe signature header.',
      data: null,
    });
  }

  let event: Stripe.Event;

  try {
    event = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return res.status(400).send('Webhook Error');
  }

  // Handle the event types
  switch (event.type) {
    case 'account.updated':
      const account = event.data.object;
      console.log(account, 'check account from webhook');

      if (
        account.charges_enabled &&
        account.details_submitted &&
        account.payouts_enabled
      ) {
        console.log(
          'Onboarding completed successfully for account:',
          account.id
        );
        const user = await prisma.user.update({
          where: {
            id: account.metadata?.userId,
            email: account.email!,
          },
          data: {
            isOnboarding: true,
          },
        });
        if(!user) {
          return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: 'User not found',
            data: null,
          });
        }
        if(user) {
        await prisma.user.update({
          where: {
            id: account.metadata?.userId,
          },
          data: {
            accountLink: null,
          },
        });
      }
      } else {
        console.log('Onboarding incomplete for account:', account.id);
      }
      break;

    case 'capability.updated':
      console.log('Capability updated event received. Handle accordingly.');
      break;

    case 'financial_connections.account.created':
      console.log(
        'Financial connections account created event received. Handle accordingly.'
      );
      break;

    case 'account.application.authorized':
      const authorizedAccount = event.data.object;
      console.log('Application authorized for account:', authorizedAccount.id);
      // Add your logic to handle this event
      break;

    case 'customer.created':
      const customer = event.data.object;
      console.log('New customer created:', customer.id);

      break;
    case 'account.external_account.created':
      const externalAccount = event.data.object;
      console.log('External account created:', externalAccount);

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send('Event received');
});

export const StripePaymentController = {
  saveCardWithCustomer,
  authorizePayment,
  capturePayment,
  refundPayment,
  createStripeAccount,
  saveNewCard,
  getSavedCards,
  deleteCard,
  handleWebHook
}