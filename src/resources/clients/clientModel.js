const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        googleId: { type: String, unique: true },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        address: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'AdminUser',
        },
        questionnaires: {
            type: Boolean,
            default: false,
        },
        subscriptionId: {
            type: Schema.Types.ObjectId,
            ref: 'Subscription',
        },
        subscriptionStatus: {
            type: String,
            enum: ['Bought', 'Not Bought'],
            default: 'Not Bought',
        },
        fcmToken: {
            type: String,
        },
        workoutPlanStatus: {
            type: String,
            enum: ['Not Requested', 'Requested', 'Assigned', 'Completed'],
            default: 'Not Requested',
        },
        workoutPlanStatusStartDate: {
            type: Date,

        },
        workoutPlanStatusEndDate: {
            type: Date,

        },
        calendlyToken: { String },
        mealPlanStatus: {
            type: String,
            enum: ['Not Requested', 'Requested', 'Assigned', 'Completed'],
            default: 'Not Requested',
        },
        mealPlanStatusStartDate: {
            type: Date,

        },
        mealPlanStatusEndDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['Active', 'Expired'],
            default: 'Active',
        },
        lastLogin: {
            type: Date,
        },
        otp: {
            type: String,
        },
        otpExpiry: {
            type: String,
        }
    },
    { timestamps: true }
);

clientSchema.pre('save', async function (next) {


    next();
});

const clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;
