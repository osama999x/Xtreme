const Notification = require('./notificationModel');

const createNotification = async (data) => {
    const notification = new Notification(data);
    return await notification.save();
};

const getNotificationById = async (id) => {
    return await Notification.findById(id);
};

const getNotificationsForClient = async (clientId) => {
    return await Notification.find({ clientId });
};

const getNotificationsForAdmin = async (adminId) => {
    return await Notification.find({ adminId });
};
const getNotifications = async (userId, role) => {
    const filter = role === 'admin' ? { adminId: userId } : { clientId: userId };

    return Notification.find(filter)
        .populate('clientId')
        .populate('adminId')
        .exec();
}

const markAsRead = async (id) => {
    return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

module.exports = {
    createNotification,
    getNotificationById,
    getNotificationsForClient,
    getNotificationsForAdmin,
    markAsRead,
    getNotifications
};
