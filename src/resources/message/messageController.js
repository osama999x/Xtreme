const asyncHandler = require('express-async-handler');
const messageService = require('./messageService');
const clientModel = require('../clients/clientModel');
const adminUserModel = require('../adminUser/adminUserModel');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const mongoose = require('mongoose');
const systemNotificationServices = require('../systemNotifications/systemNotification');

const messageController = {
    getMessagesByUserType: asyncHandler(async (req, res) => {
        const { userType, clientId } = req.query;

        if (userType === 'AdminUser') {

            const admins = await messageService.getActiveAdmins(clientId);
            return sendResponse(res, responseStatusCodes.OK, 'Active admins retrieved successfully', admins);
        } else if (userType === 'Client') {
            const clientMessages = await messageService.getLastMessagesForClients();
            return sendResponse(res, responseStatusCodes.OK, 'Last messages for clients retrieved successfully', clientMessages);
        } else {
            return sendResponse(res, responseStatusCodes.BAD, 'Invalid userType specified');
        }
    }),
    sendMessage: asyncHandler(async (req, res) => {
        const { clientId, content } = req.body;
        const message = await messageService.sendMessage(clientId, content);

        const activeAdmins = await adminUserModel.find({ isActive: true, isDeleted: false }).select('fcmToken').lean();
        const client = await clientModel.findOne({ _id: new mongoose.Types.ObjectId(clientId) }).select('name').lean();
        const clientName = client?.name || 'Unknown Client';

        const title = 'New Message Received';
        const body = `Client ${clientName} sent a new message`;

        for (const admin of activeAdmins) {
            if (admin.fcmToken) {
                await systemNotificationServices.systemNotification(
                    body,
                    title,
                    admin.fcmToken,
                    { clientId, content }
                );
            }
        }


        if (!res) {
            return await sendResponse(null, responseStatusCodes.CREATED, 'Message sent successfully', message);
        } else {
            return sendResponse(res, responseStatusCodes.CREATED, 'Message sent successfully', message);
        }
    }),

    replyToMessage: asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const { adminId, content } = req.body;

        const replyMessage = await messageService.replyToMessage(clientId, adminId, content);

        const client = await clientModel.findOne({ _id: new mongoose.Types.ObjectId(clientId) }).select('name fcmToken').lean();
        const admin = await adminUserModel.findOne({ _id: new mongoose.Types.ObjectId(adminId) }).select('firstName fcmToken').lean();

        if (client && client.fcmToken) {
            const clientName = client.name || 'Unknown Client';
            const title = 'New Reply Received';
            const body = `"${admin.firstName}" replied to your message: "${content}"`;

            await systemNotificationServices.systemNotification(
                body,
                title,
                client.fcmToken,
                { clientId, content }
            );
        }
        return sendResponse(res, responseStatusCodes.OK, 'Reply sent successfully', replyMessage);
    })
    ,


    getMessagesForClient: asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const messages = await messageService.getMessagesForClient(clientId);

        return sendResponse(res, responseStatusCodes.OK, 'Messages retrieved successfully', messages);
    }),
};

module.exports = messageController;
