
import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";

const processStripeWebhookEvent = async (event: Stripe.Event) => {
    switch (event.type) {
        case "checkout.session.completed":
            await handleCheckoutCompleted(event);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
            break;
    }
}

/**
 * When checkout.session.completed fires:
 * - Extract appointmentId from metadata
 * - Update appointment status + payment state
 */
async function handleCheckoutCompleted(event: Stripe.Event) {
    const session = event.data.object as any;

    const appointmentId = session.metadata?.appointmentId;
    const paymentId = session.metadata?.paymentId;
    const email = session.customer_email
    switch (event.type) {
        case "checkout.session.completed": {

            if (!appointmentId) {
                console.error("Appointment ID missing in metadata");
                return;
            }

            // Prevent double update
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
            });

            if (!appointment) {
                console.error("Appointment not found");
                return;
            }

            if (appointment.status === "COMPLETED") {
                console.log("Appointment already processed");
                return;
            }

            await prisma.appointment.update({
                where: { id: appointmentId },
                data: {
                    paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                },
            });
            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                    paymentGatewayData: session
                },
            });

            console.log("Appointment confirmed:", appointmentId);
            break
        }
        

        default:
            console.log("unhandled event type", event.type);
    }


}


export const PaymentService = {
    processStripeWebhookEvent
}
