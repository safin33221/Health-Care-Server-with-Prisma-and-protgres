import { Request, Response } from "express";


import dotenv from "dotenv";
import stripe from "../../helpers/stripe";
import { PaymentService } from "./payment.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import config from "../../../config";

dotenv.config();

const webhookSecret = config.strip.STRIPE_WEBHOOK_SECRET;

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {

    if (!webhookSecret) {
        return res.status(500).send("STRIPE_WEBHOOK_SECRET missing");
    }

    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
        return res.status(400).send("Missing Stripe signature");
    }

    let event;

    try {
        // Construct Stripe event — raw body required
        event = stripe.webhooks.constructEvent(
            (req as any).body,
            sig,
            webhookSecret
        );
    } catch (err: any) {
        console.error("Stripe signature error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Pass event to service for processing
    const result = await PaymentService.processStripeWebhookEvent(event);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "web req send successfully",

        data: result
    })

})


export const PaymentController = {
    handleStripeWebhook
}
