const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'AdminUser',
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
