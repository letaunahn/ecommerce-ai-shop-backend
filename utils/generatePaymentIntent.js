import Stripe from "stripe";
import database from "../database/db.js";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

export const generatePaymentIntent = async (orderId, total_price) => {
    try {
        const amountInCents = Math.round(Number(total_price) * 100)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,

            currency: "usd"
        })

        await database.query(`INSERT INTO payments(order_id, payment_type, payment_status, payment_intent_id) VALUES($1, $2, $3, $4) RETURNING *`, [orderId, 'Online', 'Pending', paymentIntent.id])

        return {
            success: true,
            clientSecret: paymentIntent.client_secret
        }
    } catch (error) {
        console.error("Payment Error: ", error.message || error);
        return {
            success: false,
            message: "Payment Failed."
        }
    }
}