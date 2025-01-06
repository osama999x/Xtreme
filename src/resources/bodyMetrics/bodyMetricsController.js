const asyncHandler = require('express-async-handler');
const bodyMetricsService = require('./bodyMetricsServices');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');

const bodyMetricsController = {
    create: asyncHandler(async (req, res) => {
        const bodyMetrics = await bodyMetricsService.create(req.body);
        return sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Body metrics added successfully',
            bodyMetrics
        );
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updatedMetrics = await bodyMetricsService.update(id, req.body);
        if (!updatedMetrics) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Body metrics not found',
                null
            );
        }
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Body metrics updated successfully',
            updatedMetrics
        );
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deletedMetrics = await bodyMetricsService.delete(id);
        if (!deletedMetrics) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Body metrics not found',
                null
            );
        }
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Body metrics deleted successfully'
        );
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const metrics = await bodyMetricsService.getById(id);
        if (!metrics) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Body metrics not found',
                null
            );
        }
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Body metrics retrieved successfully',
            metrics
        );
    }),

    getAllByClient: asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const metrics = await bodyMetricsService.getAllByClient(clientId);
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Body metrics retrieved successfully',
            metrics
        );
    }),
};

module.exports = bodyMetricsController;
