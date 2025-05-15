"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeRoutes = void 0;
// StripePayment.routes: Module file for the StripePayment.routes functionality.
const express_1 = require("express");
const StripePayment_controller_1 = require("./StripePayment.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
// Save card and create customer
router.post("/save-card", (0, auth_1.default)(), StripePayment_controller_1.StripePaymentController.saveCardWithCustomer);
// Authorize payment
router.post("/authorize-payment", (0, auth_1.default)(), StripePayment_controller_1.StripePaymentController.authorizePayment);
// Capture payment
router.post("/capture/:paymentIntentId", (0, auth_1.default)(), StripePayment_controller_1.StripePaymentController.capturePayment);
// Refund payment
router.post("/refund/:paymentIntentId", (0, auth_1.default)(), StripePayment_controller_1.StripePaymentController.refundPayment);
// Create Stripe Connect account
router.post("/create-account", (0, auth_1.default)(), StripePayment_controller_1.StripePaymentController.createStripeAccount);
// Save new card to existing customer
router.post("/save-new-card", (0, auth_1.default)(), StripePayment_controller_1.StripePaymentController.saveNewCard);
// Get customer's saved cards
router.get("/saved-cards/:customerId", (0, auth_1.default)(), StripePayment_controller_1.StripePaymentController.getSavedCards);
// Delete card
router.delete("/delete-card/:paymentMethodId", (0, auth_1.default)(), StripePayment_controller_1.StripePaymentController.deleteCard);
exports.StripeRoutes = router;
