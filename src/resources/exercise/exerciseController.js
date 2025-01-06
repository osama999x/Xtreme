const asyncHandler = require('express-async-handler');
const exerciseServices = require('./exerciseService');
const sendResponse = require('../../utils/sendResponse');
const exerciseValidator = require('./exerciseValidator');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const uploadFile = require("../../utils/uploadFile")

const exerciseController = {
    createExercise: asyncHandler(async (req, res) => {
        const validationResult = exerciseValidator.create.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        if (req.body.picture !== null && req.body.picture !== '') {
            const mealImage = await uploadFile(req.body.picture);
            req.body.picture = mealImage;
        }

        const exercise = await exerciseServices.create(req.body);
        return await sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Exercise created successfully',
            exercise,
            req.logId
        );
    }),

    updateExercise: asyncHandler(async (req, res) => {
        const validationResult = exerciseValidator.update.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }
        if (req.body.picture !== null && req.body.picture !== '') {
            const mealImage = await uploadFile(req.body.picture);
            req.body.picture = mealImage;
        }
        const updatedExercise = await exerciseServices.update(req.params.id, req.body);
        if (updatedExercise) {
            return await sendResponse(
                res,
                responseStatusCodes.OK,
                'Exercise updated successfully',
                updatedExercise,
                req.logId
            );
        } else {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Exercise not found',
                null,
                req.logId
            );
        }
    }),

    getAllExercises: asyncHandler(async (req, res) => {
        const exercises = await exerciseServices.getAll();
        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Exercises retrieved successfully',
            exercises,
            req.logId
        );
    }),

    getExerciseById: asyncHandler(async (req, res) => {
        const validationResult = exerciseValidator.getById.validate(req.params);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const exercise = await exerciseServices.getById(req.params.id);
        if (!exercise) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Exercise not found',
                null,
                req.logId
            );
        }

        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Exercise retrieved successfully',
            exercise,
            req.logId
        );
    }),

    deleteExercise: asyncHandler(async (req, res) => {
        const deleted = await exerciseServices.delete(req.params.id);
        if (!deleted) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Exercise not found',
                null,
                req.logId
            );
        }
        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Exercise deleted successfully',
            null,
            req.logId
        );
    }),
};

module.exports = exerciseController;
