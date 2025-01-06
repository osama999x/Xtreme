const express = require('express');
const FitnessRouter = express.Router();
const FitnessQuestionsController = require('./fitnessQuestionaresController');
const { createFitnessQuestionsValidator } = require('./fitnessQuestionaresValidator');


FitnessRouter.post('/', FitnessQuestionsController.create);


FitnessRouter.get('/:clientId', FitnessQuestionsController.getByClientId);

FitnessRouter.put('/:clientId', createFitnessQuestionsValidator, FitnessQuestionsController.update);

FitnessRouter.delete('/:clientId', FitnessQuestionsController.delete);

module.exports = FitnessRouter;
