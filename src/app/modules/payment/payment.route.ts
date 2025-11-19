import express from "express";

import { PaymentController } from "./payment.controller";


const router = express.Router();

/**
 * Stripe Webhook MUST receive raw body, not JSON
 */
// router.post(
//     "/webhook",
//     bodyParser.raw({ type: "application/json" }),
//     PaymentController.handleStripeWebhook
// );

export default router;
