"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripePaymentController = void 0;
const StripePayment_service_1 = require("./StripePayment.service");
const http_status_1 = __importDefault(require("http-status"));
//import ApiError from "../../../errors/ApiErrors";
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
// saveCardWithCustomer
const saveCardWithCustomer = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await StripePayment_service_1.StripeService.saveCardWithCustomerInfoIntoStripe(req.body, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "card saved successfully!",
        data: result,
    });
});
//authorizePayment
const authorizePayment = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const { offerId, paymentMethodId } = req.body;
    const result = await StripePayment_service_1.StripeService.authorizedPaymentWithSaveCardFromStripe(userId, { offerId, paymentMethodId });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "payment authorized successfully!",
        data: result,
    });
});
//capturePayment
const capturePayment = (0, catchAsync_1.default)(async (req, res) => {
    const { paymentIntentId } = req.params;
    const result = await StripePayment_service_1.StripeService.capturePayment(paymentIntentId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "payment Captured successfully!",
        data: result,
    });
});
//refundPayment
const refundPayment = (0, catchAsync_1.default)(async (req, res) => {
    const { paymentIntentId } = req.params;
    const result = await StripePayment_service_1.StripeService.refundPayment(paymentIntentId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "payment refund successfully!",
        data: result,
    });
});
//createStripeAccount
const createStripeAccount = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.id; // Ensure you're passing only the user ID
    if (!userId) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "User ID is required");
    }
    const result = await StripePayment_service_1.StripeService.createAccountIntoStripe(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Stripe account successfully created!",
        data: result,
    });
});
//saveNewCard
const saveNewCard = (0, catchAsync_1.default)(async (req, res) => {
    const { customerId, paymentMethodId } = req.body;
    const result = await StripePayment_service_1.StripeService.saveNewCardWithExistingCustomerIntoStripe({ customerId, paymentMethodId });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "New card saved successfully!",
        data: result,
    });
});
//getSavedCards
const getSavedCards = (0, catchAsync_1.default)(async (req, res) => {
    const { customerId } = req.params;
    const result = await StripePayment_service_1.StripeService.getCustomerSavedCards(customerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "cards retrieve successfully!",
        data: result,
    });
});
//deleteCard
const deleteCard = (0, catchAsync_1.default)(async (req, res) => {
    const { paymentMethodId } = req.params;
    const result = await StripePayment_service_1.StripeService.deleteCardFromCustomer(paymentMethodId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "card deleted successfully!",
        data: result,
    });
});
//webhook
const handleWebHook = (0, catchAsync_1.default)(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    console.log(sig);
    if (!sig) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'Missing Stripe signature header.',
            data: null,
        });
    }
    let event;
    try {
        event = stripe_1.default.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error('Webhook signature verification failed.', err);
        return res.status(400).send('Webhook Error');
    }
    // Handle the event types
    switch (event.type) {
        case 'account.updated':
            const account = event.data.object;
            console.log(account, 'check account from webhook');
            if (account.charges_enabled &&
                account.details_submitted &&
                account.payouts_enabled) {
                console.log('Onboarding completed successfully for account:', account.id);
                const user = await prisma_1.default.user.update({
                    where: {
                        id: account.metadata?.userId,
                        email: account.email,
                    },
                    data: {
                        isOnboarding: true,
                    },
                });
                if (!user) {
                    return (0, sendResponse_1.default)(res, {
                        statusCode: http_status_1.default.NOT_FOUND,
                        success: false,
                        message: 'User not found',
                        data: null,
                    });
                }
                if (user) {
                    await prisma_1.default.user.update({
                        where: {
                            id: account.metadata?.userId,
                        },
                        data: {
                            accountLink: null,
                        },
                    });
                }
            }
            else {
                console.log('Onboarding incomplete for account:', account.id);
            }
            break;
        case 'capability.updated':
            console.log('Capability updated event received. Handle accordingly.');
            break;
        case 'financial_connections.account.created':
            console.log('Financial connections account created event received. Handle accordingly.');
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
exports.StripePaymentController = {
    saveCardWithCustomer,
    authorizePayment,
    capturePayment,
    refundPayment,
    createStripeAccount,
    saveNewCard,
    getSavedCards,
    deleteCard,
    handleWebHook
};
