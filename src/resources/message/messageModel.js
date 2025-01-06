const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'senderModel',
        },
        senderModel: {
            type: String,
            required: true,
            enum: ['AdminUser', 'Client'],
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            refPath: 'receiverModel',
        },
        receiverModel: {
            type: String,
            required: true,
            enum: ['AdminUser', 'Client'],
        },
        message: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        isSenderSeen: {
            type: Boolean,
            default: false,
        },
        isReceiverSeen: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
