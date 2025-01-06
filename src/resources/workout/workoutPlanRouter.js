const express = require('express');
const workoutPlanController = require('./workoutPlanController');
const workoutPlanRouter = express.Router();

workoutPlanRouter.post('/gpt', workoutPlanController.generateWorkoutPlan)
workoutPlanRouter.post('/saveGpt', workoutPlanController.saveGPTWorkoutPlan)
workoutPlanRouter.post('/status', workoutPlanController.updateWorkoutPlanStatus);
workoutPlanRouter
    .route('/')
    .post(workoutPlanController.createWorkoutPlan);

workoutPlanRouter
    .route('/:id')
    .get(workoutPlanController.getWorkoutPlanById)
    .put(workoutPlanController.updateWorkoutPlan)
    .delete(workoutPlanController.deleteWorkoutPlan);

workoutPlanRouter
    .route('/client/')
    .post(workoutPlanController.getAllWorkoutPlansByClient);

module.exports = workoutPlanRouter;
