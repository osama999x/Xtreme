const asyncHandler = require('express-async-handler');
const checkinStatusService = require('./checkInStatusService');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');

const checkinStatusController = {
    checkin: asyncHandler(async (req, res) => {
        const { clientId } = req.body;

        const checkinRecord = await checkinStatusService.checkin(clientId);
        return sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Check-in recorded successfully',
            checkinRecord
        );
    }),

    checkout: asyncHandler(async (req, res) => {
        const { clientId } = req.body;

        const checkoutRecord = await checkinStatusService.checkout(clientId);
        if (!checkoutRecord) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Check-in record not found for checkout',
                null
            );
        }
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Check-out recorded successfully',
            checkoutRecord
        );
    }),

    getCheckinHistory: asyncHandler(async (req, res) => {
        const { clientId } = req.params;

        const checkinHistory = await checkinStatusService.getAllByClient(clientId);
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Check-in history retrieved successfully',
            checkinHistory
        );
    }),
    getHistory: asyncHandler(async (req, res) => {

        const checkinHistory = await checkinStatusService.getAllClient();
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Check-in history retrieved successfully',
            checkinHistory
        );
    }),
};

module.exports = checkinStatusController;
