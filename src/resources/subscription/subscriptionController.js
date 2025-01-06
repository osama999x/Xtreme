// subscriptionController.js
const asyncHandler = require('express-async-handler');
const subscriptionService = require('./subscriptionService');
const { validateSubscription } = require('./subscriptionValidator');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const Stripe = require('../../utils/stripe')
const subscriptionPriceCodes = require('../../constants/subscriptionPriceCodes');
const clientModel = require('../clients/clientModel')
const mongoose = require('mongoose');
const systemNotification = require('../systemNotifications/systemNotification');
const adminUserModel = require('../adminUser/adminUserModel')
const notificationService = require('../notifications/notificationService')

const subscriptionController = {
    createSubscription: asyncHandler(async (req, res) => {
        const { error } = validateSubscription(req.body);
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }

        const { clientId, customerData, planType } = req.body;

        const planDetails = subscriptionPriceCodes[planType];
        if (!planDetails) {
            return sendResponse(res, responseStatusCodes.BAD, 'Invalid plan type');
        }

        const price = planDetails.price;

        const existingSubscription = await subscriptionService.findActiveSubscription(clientId);
        if (existingSubscription) {
            return sendResponse(res, responseStatusCodes.BAD, 'Active subscription already exists.');
        }

        const paymentIntentResponse = await Stripe.createPaymentIntent(price, customerData);
        if (!paymentIntentResponse.success) {
            console.error("Payment intent creation failed:", paymentIntentResponse);
            return sendResponse(res, responseStatusCodes.BAD, 'Payment intent creation failed');
        }

        return sendResponse(res, responseStatusCodes.OK, 'Payment Intent created successfully', {
            clientSecret: paymentIntentResponse.clientSecret,
            paymentIntentId: paymentIntentResponse.paymentIntentId,
        });
    }),



    confirmPaymentAndCreateSubscription: asyncHandler(async (req, res) => {
        const { paymentIntentId, paymentMethodId, clientId, planType } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const planDetails = subscriptionPriceCodes[planType];
            if (!planDetails) {
                await session.abortTransaction();
                session.endSession();
                return sendResponse(res, responseStatusCodes.BAD, 'Invalid plan type');
            }

            const { price, duration: durationMonths } = planDetails;
            const expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + durationMonths);

            const subscriptionData = {
                clientId,
                planType,
                price,
                durationMonths,
                expirationDate,
                payment: false,
            };

            const subscription = await subscriptionService.createSubscription(subscriptionData, { session });
            if (!subscription) {
                await session.abortTransaction();
                session.endSession();
                return sendResponse(res, responseStatusCodes.BAD, 'Failed to create subscription');
            }

            const confirmResponse = await Stripe.confirmPaymentIntent(paymentIntentId, paymentMethodId);
            if (!confirmResponse.success) {
                await session.abortTransaction();
                session.endSession();
                return sendResponse(res, responseStatusCodes.BAD, `Payment confirmation failed: ${confirmResponse.error}`);
            }

            subscription.payment = true;
            await subscription.save({ session });

            const clientSubscriptionStatusUpdate = await clientModel.findOneAndUpdate(
                { _id: clientId },
                { subscriptionId: subscription.id, subscriptionStatus: 'Bought' },
                { new: true, session }
            );

            if (!clientSubscriptionStatusUpdate) {
                await session.abortTransaction();
                session.endSession();
                return sendResponse(res, responseStatusCodes.BAD, 'Failed to update client subscription status');
            }

            const client = await clientModel.findById(clientId);
            if (!client) {
                await session.abortTransaction();
                session.endSession();
                return sendResponse(res, responseStatusCodes.BAD, 'Client not found');
            }

            const admins = await adminUserModel.find();
            const notificationPromises = admins.map(async (admin) => {
                const notificationData = {
                    title: 'Subscription Payment Confirmed',
                    body: `${client.name} successfully subscribed to the ${planType} plan.`,
                    message: `Client ${client.name} has paid for the ${planType} plan.`,
                    clientId: clientId,
                    adminId: admin._id,
                };

                await notificationService.createNotification(notificationData);

                const fcmToken = admin.fcmToken;
                if (fcmToken) {
                    await systemNotification.systemNotification(
                        notificationData.body,
                        notificationData.title,
                        fcmToken,
                        { clientId, planType, clientName: client.name }
                    );
                }
            });

            await Promise.all(notificationPromises);

            await session.commitTransaction();
            session.endSession();

            return sendResponse(res, responseStatusCodes.CREATED, 'Subscription created successfully', {
                subscription,
                amountPaid: price,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('Transaction failed:', error);
            return sendResponse(res, responseStatusCodes.BAD, 'Transaction failed. Please try again.');
        }
    }),

    getSubscriptions: asyncHandler(async (req, res) => {
        const subscriptions = await subscriptionService.getSubscriptions(req.query.clientId);
        return sendResponse(res, responseStatusCodes.OK, 'Subscriptions retrieved successfully', subscriptions);
    }),

    getSubscriptionById: asyncHandler(async (req, res) => {
        const subscription = await subscriptionService.getSubscriptionById(req.params.id);
        if (!subscription) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Subscription not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Subscription retrieved successfully', subscription);
    }),


    getSubscriptionByClientId: asyncHandler(async (req, res) => {
        const subscription = await subscriptionService.getSubscriptionByClientId(req.params.id);
        if (!subscription) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Subscription not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Subscription retrieved successfully', subscription);
    }),
    updateSubscription: asyncHandler(async (req, res) => {
        const { error } = validateSubscription(req.body);
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }

        const updatedSubscription = await subscriptionService.updateSubscription(req.params.id, req.body);
        if (!updatedSubscription) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Subscription not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Subscription updated successfully', updatedSubscription);
    }),

    deleteSubscription: asyncHandler(async (req, res) => {
        const result = await subscriptionService.deleteSubscription(req.params.id);
        if (!result) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Subscription not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Subscription deleted successfully');
    }),
};

module.exports = subscriptionController;
