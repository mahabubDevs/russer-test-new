// StripePayment.routes: Module file for the StripePayment.routes functionality.
import { Router } from "express";
import { StripePaymentController } from "./StripePayment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

// Save card and create customer
router.post("/save-card", auth(), StripePaymentController.saveCardWithCustomer);

// Authorize payment
router.post("/authorize-payment", auth(), StripePaymentController.authorizePayment);

// Capture payment
router.post("/capture/:paymentIntentId", auth(), StripePaymentController.capturePayment);

// Refund payment
router.post("/refund/:paymentIntentId", auth(), StripePaymentController.refundPayment);

// Create Stripe Connect account
router.post("/create-account", auth(), StripePaymentController.createStripeAccount);

// Save new card to existing customer
router.post("/save-new-card", auth(), StripePaymentController.saveNewCard);

// Get customer's saved cards
router.get("/saved-cards/:customerId", auth(), StripePaymentController.getSavedCards);

// Delete card
router.delete("/delete-card/:paymentMethodId", auth(), StripePaymentController.deleteCard);



export const StripeRoutes = router;