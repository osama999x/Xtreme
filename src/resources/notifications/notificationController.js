const asyncHandler = require('express-async-handler');
const notificationService = require('./notificationService');
const sendResponse = require('../../utils/sendResponse');
const notificationValidator = require('./notificationValidator');
const responseStatusCodes = require('../../constants/responseStatusCodes');

const notificationController = {

    createNotification: asyncHandler(async (req, res) => {
        const validationResult = notificationValidator.create.validate(req.body);
        if (validationResult.error) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                `Validation error: ${validationResult.error.details[0].message}`,
                null,
                req.logId
            );
        }

        const notification = await notificationService.createNotification(req.body);
        return sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Notification created successfully',
            notification,
            req.logId
        );
    }),

    // Retrieve notification by ID
    getNotificationById: asyncHandler(async (req, res) => {
        const validationResult = notificationValidator.getById.validate(req.params);
        if (validationResult.error) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                `Validation error: ${validationResult.error.details[0].message}`,
                null,
                req.logId
            );
        }

        const notification = await notificationService.getNotificationById(req.params.id);
        if (!notification) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Notification not found',
                null,
                req.logId
            );
        }

        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Notification retrieved successfully',
            notification,
            req.logId
        );
    }),

    // Retrieve notifications for a specific client
    getNotificationsForClient: asyncHandler(async (req, res) => {
        const notifications = await notificationService.getNotifications(req.params.clientId, 'client');
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Client notifications retrieved successfully',
            notifications,
            req.logId
        );
    }),

    // Retrieve notifications for a specific admin
    getNotificationsForAdmin: asyncHandler(async (req, res) => {
        const notifications = await notificationService.getNotifications(req.params.adminId, 'admin');
        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Admin notifications retrieved successfully',
            notifications,
            req.logId
        );
    }),

    // Mark notification as read
    markAsRead: asyncHandler(async (req, res) => {
        const validationResult = notificationValidator.markAsRead.validate(req.params);
        if (validationResult.error) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                `Validation error: ${validationResult.error.details[0].message}`,
                null,
                req.logId
            );
        }

        const notification = await notificationService.markAsRead(req.params.id);
        if (!notification) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Notification not found',
                null,
                req.logId
            );
        }

        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Notification marked as read',
            notification,
            req.logId
        );
    }),

    // General getNotifications method for client or admin based on query parameters
    getNotifications: asyncHandler(async (req, res) => {
        const { adminId, clientId } = req.query;

        if (!adminId && !clientId) {
            return res.status(400).json({ error: 'adminId or clientId is required' });
        }

        const userId = adminId || clientId;
        const role = adminId ? 'admin' : 'client';

        try {
            const notifications = await notificationService.getNotifications(userId, role);
            res.status(200).json({ notifications });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve notifications' });
        }
    }),
};

module.exports = notificationController;
