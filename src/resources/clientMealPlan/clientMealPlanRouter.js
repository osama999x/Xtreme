const express = require('express');
const clientMealPlanRouter = express.Router();
const clientMealPlanController = require('./clientMealPlanController');


clientMealPlanRouter.post('/', clientMealPlanController.createMealPlan);

clientMealPlanRouter.get('/', clientMealPlanController.getMealPlans);

clientMealPlanRouter.get('/:id', clientMealPlanController.getMealPlanById);
clientMealPlanRouter.post('/client/', clientMealPlanController.getMealPlanByClientId);

clientMealPlanRouter.put('/:id', clientMealPlanController.updateMealPlan);

clientMealPlanRouter.delete('/:id', clientMealPlanController.deleteMealPlan);

clientMealPlanRouter.post('/saveGpt', clientMealPlanController.saveGPTMealPlan)
clientMealPlanRouter.post('/gpt', clientMealPlanController.generateMealPlan);
clientMealPlanRouter.post('/status', clientMealPlanController.updateMealPlanStatus);

module.exports = clientMealPlanRouter;
