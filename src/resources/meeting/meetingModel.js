const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const meetingSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },

    meetingDate: {
        type: Date,
        required: true,
    },
    meetingTime: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending',
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

const MeetingModel = mongoose.model('Meeting', meetingSchema);

module.exports = MeetingModel;
