const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkinStatusSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        checkinTime: {
            type: Date,
        },
        checkoutTime: {
            type: Date,
        },
    },
    { timestamps: true }
);

const CheckinStatus = mongoose.model('CheckinStatus', checkinStatusSchema);

module.exports = CheckinStatus;
