// stripeService.js
const Stripe = require('stripe');
require('dotenv').config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const sendResponse = require('../utils/sendResponse');
const apiLogServices = require('../resources/apiLog/apiLogServices');


const createPaymentIntent = async (totalbill, customerData) => {
    try {
        const amount = Math.round(totalbill * 100);
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
                CustomerName: customerData.name,
                CustomerEmail: customerData.email,
                CustomerPhone: customerData.phone
            },
        });

        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    } catch (error) {
        console.error("Error creating payment intent:", error.message);
        return { success: false, error: error.message };
    }
};


const createCharge = async (totalbill, stripeToken, customerData) => {
    try {

        const amount = Math.round(totalbill * 100);

        const charge = await stripe.charges.create({
            amount,
            currency: 'usd',
            source: stripeToken,
            description: 'Payment from the X-Treme website via Stripe.',
            metadata: {
                CustomerID: customerData._id,
                CustomerEmail: customerData.email,
            },
        });


        if (charge.status === 'succeeded') {
            return { success: true, message: charge.outcome.seller_message, charge };
        } else {
            return { success: false, error: 'Payment failed', charge };
        }
    } catch (error) {
        console.error("Payment error:", error.message);
        return { success: false, error: error.message };
    }
};
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return sendResponse(res, 400, `Webhook Error: ${err.message}`, null);
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            console.log("Payment succeeded event received!");
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return sendResponse(res, 200, 'Webhook event received', { received: true });
};

const confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId,
        });

        if (paymentIntent.status === 'succeeded') {
            return { success: true, paymentIntent };
        } else {
            return { success: false, error: 'Payment failed' };
        }
    } catch (error) {
        console.error("Error confirming payment intent:", error.message);
        return { success: false, error: error.message };
    }
};



module.exports = {
    createPaymentIntent,
    createCharge,
    handleWebhook,
    confirmPaymentIntent
};
