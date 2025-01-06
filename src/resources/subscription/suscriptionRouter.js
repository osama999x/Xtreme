const express = require('express');
const subscriptionRouter = express.Router();
const subscriptionController = require('./subscriptionController');


subscriptionRouter.post('/', subscriptionController.createSubscription);
subscriptionRouter.get('/', subscriptionController.getSubscriptions);
subscriptionRouter.get('/:id', subscriptionController.getSubscriptionById);
subscriptionRouter.get('/client/:id', subscriptionController.getSubscriptionByClientId);
subscriptionRouter.put('/:id', subscriptionController.updateSubscription);
subscriptionRouter.delete('/:id', subscriptionController.deleteSubscription);
subscriptionRouter.post('/confirm-payment', subscriptionController.confirmPaymentAndCreateSubscription);

module.exports = subscriptionRouter;
