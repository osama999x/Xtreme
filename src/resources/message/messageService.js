const mongoose = require('mongoose');
const Message = require('./messageModel');
const adminUserModel = require('../adminUser/adminUserModel');
const clientModel = require('../clients/clientModel');
const systemNotificationServices = require('../systemNotifications/systemNotification');

class MessageService {
    static async getActiveAdmins(clientId) {
        try {

            const admins = await adminUserModel.find({ isActive: true, isDeleted: false })
                .select('_id firstName lastName profilePicture')
                .lean();


            for (const admin of admins) {
                const lastMessage = await Message.findOne({
                    senderId: clientId,
                    receiverId: admin._id
                })
                    .sort({ createdAt: -1 })
                    .select('message createdAt ')
                    .lean();

                if (lastMessage) {
                    admin.lastMessage = lastMessage.message;
                    admin.timestamp = lastMessage.timestamp;
                } else {
                    admin.lastMessage = 'No message found';
                    admin.timestamp = null;
                }
            }

            return admins;
        } catch (error) {
            console.error('Error fetching active admins and last messages:', error);
            throw new Error('Could not fetch active admins and last messages');
        }
    }


    static async getLastMessagesForClients() {
        try {
            const messages = await Message.aggregate([
                {
                    $match: {
                        $or: [
                            { senderModel: 'Client', receiverModel: 'AdminUser' },
                            { senderModel: 'AdminUser', receiverModel: 'Client' }
                        ]
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $group: {
                        _id: {
                            clientId: {
                                $cond: { if: { $eq: ["$senderModel", "Client"] }, then: "$senderId", else: "$receiverId" }
                            }
                        },
                        lastMessage: { $first: "$$ROOT" }
                    }
                },
                {
                    $replaceRoot: { newRoot: "$lastMessage" }
                },
                {
                    $lookup: {
                        from: 'clients',
                        let: { clientId: { $cond: { if: { $eq: ["$senderModel", "Client"] }, then: "$senderId", else: "$receiverId" } } },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$clientId"] } } }
                        ],
                        as: 'clientDetails'
                    }
                },
                {
                    $unwind: '$clientDetails'
                },
                {
                    $project: {
                        message: 1,
                        timestamp: 1,
                        'clientDetails._id': 1,
                        'clientDetails.name': 1,
                        'clientDetails.email': 1,
                        'clientDetails.phone': 1,
                        'clientDetails.profilePicture': 1
                    }
                },
                {
                    $sort: { timestamp: -1 }
                }
            ]);


            return messages;
        } catch (error) {
            console.error('Error fetching last messages for clients:', error);
            throw new Error('Could not fetch last messages for clients');
        }
    }


    static async getPastMessages(clientId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(clientId)) {
                throw new Error('Invalid client ID format');
            }

            const objectId = new mongoose.Types.ObjectId(clientId);

            return await Message.find({
                $or: [
                    { senderId: objectId, senderModel: 'Client' },
                    { receiverId: objectId, receiverModel: 'Client' }
                ]
            }).sort({ timestamp: 1 });
        } catch (error) {
            console.error('Error fetching past messages:', error);
            throw new Error('Could not fetch past messages');
        }
    }

    static async saveClientMessage(clientId, message) {
        try {

            if (!mongoose.Types.ObjectId.isValid(clientId)) {
                throw new Error('Invalid client ID format');
            }

            const newMessage = new Message({
                senderId: new mongoose.Types.ObjectId(clientId),
                senderModel: 'Client',
                receiverModel: 'AdminUser',
                message,
            });

            const savedMessage = await newMessage.save();

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
                        { clientId, content: message }
                    );

                    console.log(`Notification sent to admin with FCM token: ${admin.fcmToken}`);
                }
            }

            return savedMessage;

        } catch (error) {
            console.error('Error saving client message:', error);
            throw new Error('Could not save client message');
        }
    }

    static async saveAdminMessage(clientId, adminId, message) {
        try {

            if (!mongoose.Types.ObjectId.isValid(clientId) || !mongoose.Types.ObjectId.isValid(adminId)) {
                throw new Error('Invalid client ID or admin ID format');
            }

            const newMessage = new Message({
                senderId: new mongoose.Types.ObjectId(adminId),
                senderModel: 'AdminUser',
                receiverId: new mongoose.Types.ObjectId(clientId),
                receiverModel: 'Client',
                message,
            });

            const savedMessage = await newMessage.save();

            const client = await clientModel.findOne({ _id: new mongoose.Types.ObjectId(clientId) }).select('name fcmToken').lean();
            const admin = await adminUserModel.findOne({ _id: new mongoose.Types.ObjectId(adminId) }).select('firstName fcmToken').lean();

            if (client && client.fcmToken) {
                const clientName = client.name || 'Unknown Client';
                const title = 'New Message Received';
                const body = `"${admin.firstName}" Message:  "${message}"`;

                await systemNotificationServices.systemNotification(
                    body,
                    title,
                    client.fcmToken,
                    { clientId, content: message }
                );
                console.log(`Notification sent to client with FCM token: ${client.fcmToken}`);
            }

            return savedMessage;
        } catch (error) {
            console.error('Error saving admin message:', error);
            throw new Error('Could not save admin message');
        }
    }


    static async getMessagesBetweenClientAndAdmin(clientId, adminId) {
        try {
            let filter = {};


            if (clientId) {
                if (!mongoose.Types.ObjectId.isValid(clientId)) {
                    throw new Error('Invalid client ID format');
                }
                const clientObjectId = new mongoose.Types.ObjectId(clientId);
                if (!filter.$or) filter.$or = [];
                filter.$or.push(
                    { senderId: clientObjectId, senderModel: 'Client' },
                    { receiverId: clientObjectId, receiverModel: 'Client' }
                );
            }

            if (adminId) {
                if (!mongoose.Types.ObjectId.isValid(adminId)) {
                    throw new Error('Invalid admin ID format');
                }
                const adminObjectId = new mongoose.Types.ObjectId(adminId);
                if (!filter.$or) filter.$or = [];
                filter.$or.push(
                    { senderId: adminObjectId, senderModel: 'AdminUser' },
                    { receiverId: adminObjectId, receiverModel: 'AdminUser' }
                );
            }

            return await Message.find(filter).sort({ timestamp: -1 });
        } catch (error) {
            console.error('Error fetching messages between client and admin:', error);
            throw new Error('Could not fetch messages between client and admin');
        }
    }

}

module.exports = MessageService;
