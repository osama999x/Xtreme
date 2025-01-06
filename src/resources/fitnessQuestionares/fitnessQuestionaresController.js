const asyncHandler = require('express-async-handler');
const DemographicsService = require('../demographics/demographicsService');
const FitnessQuestionsService = require('./fiitnessQuestionaresService');
const NutritionAndExerciseHabitsService = require('../nutritionAndExercise/nutritionAndExerciseServices');
const { combinedSchema } = require('./fitnessQuestionaresValidator');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const clientServices = require('../clients/clientService');

const FitnessQuestionsController = {
    create: asyncHandler(async (req, res) => {
        const { error } = combinedSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }

        const data = req.body;

        const demographics = await DemographicsService.create(data);
        const fitnessQuestions = await FitnessQuestionsService.createFitnessQuestions(data);
        const nutritionAndExerciseHabits = await NutritionAndExerciseHabitsService.create(data);
        if (demographics && fitnessQuestions && nutritionAndExerciseHabits) {
            const user = await clientServices.update(data?.clientId, { questionnaires: true })
        }
        return sendResponse(res, responseStatusCodes.CREATED, 'Data created successfully', {
            demographics,
            fitnessQuestions,
            nutritionAndExerciseHabits,
        });
    }),

    getByClientId: asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const fitnessQuestions = await FitnessQuestionsService.getClientDetails(clientId);
        if (!fitnessQuestions) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Not Found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Retrieved successfully', fitnessQuestions);
    }),

    update: asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const data = req.body;

        const updatedFitnessQuestions = await FitnessQuestionsService.updateFitnessQuestions(clientId, data);
        if (!updatedFitnessQuestions) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Fitness questions not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Fitness questions updated successfully', updatedFitnessQuestions);
    }),

    delete: asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const deletedFitnessQuestions = await FitnessQuestionsService.deleteFitnessQuestions(clientId);
        if (!deletedFitnessQuestions) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Fitness questions not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Fitness questions deleted successfully');
    }),
};

module.exports = FitnessQuestionsController;
