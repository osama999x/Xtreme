const admin = require('firebase-admin');
const serviceAccount = require('../../../xtreme-c3bb2-firebase-adminsdk-3x24g-b4a2521e05.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

/**
 * Send a push notification
 * @param {string} title - The title of the notification.
 * @param {string} body - The body text of the notification.
 * @param {string} fcmToken - The FCM token of the recipient.
 * @param {object} data - Additional data to send with the notification.
 * @param {string} [image] - Optional image URL for the notification.
 */
const sendNotification = async (title, body, fcmToken, data = {}, image) => {

    if (!fcmToken) {
        console.warn('FCM Token is missing. Notification will not be sent.');
        return;
    }

    const message = {
        notification: {
            title,
            body,
        },
        data: {
            ...data,
            ...(image ? { image } : {}),
        },
        token: fcmToken,
    };

    try {
        const response = await messaging.send(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        if (error.code === 'messaging/registration-token-not-registered') {
            console.warn('Registration token not registered, skipping notification.');
            return;
        }
        console.error('Error sending message:', error);
        throw error;
    }
};

module.exports = sendNotification;
