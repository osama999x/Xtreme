// services/meetingService.js
const MeetingModel = require('./meetingModel');
const Notification = require('../notifications/notificationService');
const sendNotification = require('../systemNotifications/systemNotification');
const AdminUser = require('../adminUser/adminUserModel');
const Client = require('../clients/clientModel');

class MeetingService {
    async createMeeting(clientId, meetingDate, meetingTime, notes) {
        // Convert meetingDate to a Date object
        const meetingDateObj = new Date(meetingDate);

        // Check if meetingDate is a valid Date
        if (isNaN(meetingDateObj)) {
            throw new Error('Invalid meeting date');
        }

        const newMeeting = new MeetingModel({
            clientId,
            meetingDate: meetingDateObj,
            meetingTime,
            notes,
        });

        const savedMeeting = await newMeeting.save();

        const admins = await AdminUser.find({ isActive: true });
        if (!admins || admins.length === 0) {
            throw new Error('No active admins found');
        }

        const client = await Client.findById(clientId);
        if (!client) {
            throw new Error('Client not found');
        }

        // Format the meetingDate properly
        const formattedMeetingDate = meetingDateObj.toLocaleDateString('en-US');

        const clientNotificationData = {
            title: 'Meeting Request Submitted',
            body: `Your meeting request for ${formattedMeetingDate} at ${meetingTime} has been submitted.`,
            message: `Meeting Details:\nDate: ${formattedMeetingDate}\nTime: ${meetingTime}\nNotes: ${notes}`,
            clientId: clientId,
        };

        await Notification.createNotification(clientNotificationData);

        for (let admin of admins) {
            if (admin.fcmToken) {
                const pushNotificationData = {
                    title: 'New Meeting Request',
                    body: `Client ${client.name} has requested a meeting.`,
                    fcmToken: admin.fcmToken,
                    data: {
                        clientName: client.name,
                        meetingDate: meetingDateObj.toString(),
                        meetingTime: meetingTime.toString(),
                        notes: notes,
                    },
                };

                await sendNotification.systemNotification(
                    pushNotificationData.title,
                    pushNotificationData.body,
                    pushNotificationData.fcmToken,
                    pushNotificationData.data
                );
            }
        }

        return savedMeeting;
    }






    async getMeetingsByClient(clientId) {
        try {
            return await MeetingModel.find({ clientId }).populate('clientId')
        } catch (error) {
            throw new Error(`Error fetching meetings: ${error.message}`);
        }
    }

    async getMeetingsByAdmin() {
        try {
            return await MeetingModel.find()
                .populate('clientId')
                .sort({ createdAt: -1 });

        } catch (error) {
            throw new Error(`Error fetching meetings: ${error.message}`);
        }
    }

    async updateMeetingStatus(meetingId, status) {
        try {
            return await MeetingModel.findByIdAndUpdate(meetingId, { status }, { new: true });
        } catch (error) {
            throw new Error(`Error updating meeting status: ${error.message}`);
        }
    }

    async deleteMeeting(meetingId) {
        try {
            await MeetingModel.findByIdAndDelete(meetingId);
            return { message: 'Meeting deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting meeting: ${error.message}`);
        }
    }
}

module.exports = new MeetingService();
