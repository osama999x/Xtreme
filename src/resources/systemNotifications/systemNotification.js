const sendNotification = require('./sendNotification');

const systemNotificationServices = {
    newNotification: async (
        body,
        title,
        fcmToken,
        data,
        image
    ) => {
        console.log({ body, title, fcmToken, data, image });

        try {
            const response = await sendNotification(title, body, fcmToken, data, image);
            return response;
        } catch (error) {
            console.error('Error in newNotification:', error);
            throw error;
        }
    },

    systemNotification: async (
        body,
        title,
        fcmToken,
        data
    ) => {
        try {
            const response = await sendNotification(title, body, fcmToken, data);
            return response;
        } catch (error) {
            console.error('Error in systemNotification:', error);
            throw error;
        }
    },
};

module.exports = systemNotificationServices;
