const asyncHandler = require('express-async-handler');
const dailyWellnessService = require('./dailyWellnessService');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const workoutStatus = require('../workout/workoutPlanServices')
const clientMealPlanStatus = require('../clientMealPlan/clientMealPlanService')


const dailyWellnessController = {
    create: asyncHandler(async (req, res) => {
        const dailyWellness = await dailyWellnessService.create(req.body);
        console.log(`req.body`, req.body)
        const updateWorkoutPlanStatus = await workoutStatus.updateWorkoutPlanStatus(req.body.clientId, req.body.date, req.body.workouts);
        const updateClientMealPlanStatus = await clientMealPlanStatus.updateMealPlanStatus(req.body.clientId, req.body.date, req.body.clientMealPlan);
        if (dailyWellness) {
            return sendResponse(
                res,
                responseStatusCodes.CREATED,
                'Daily wellness record created successfully',
                dailyWellness
            );
        }
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updatedWellness = await dailyWellnessService.update(id, req.body);
        if (!updatedWellness) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Daily wellness record not found',
                null
            );
        }
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Daily wellness record updated successfully',
            updatedWellness
        );
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deletedWellness = await dailyWellnessService.delete(id);
        if (!deletedWellness) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Daily wellness record not found',
                null
            );
        }
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Daily wellness record deleted successfully'
        );
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const wellness = await dailyWellnessService.getById(id);
        if (!wellness) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Daily wellness record not found',
                null
            );
        }
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Daily wellness record retrieved successfully',
            wellness
        );
    }),

    getAllByClient: asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const wellnessRecords = await dailyWellnessService.getAllByClient(clientId);
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Daily wellness records retrieved successfully',
            wellnessRecords
        );
    }),
};

module.exports = dailyWellnessController;
