const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutPlanSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        day: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
        },
        period: {
            type: String,
            enum: ['Weekly', 'Monthly', 'Daily'],

        },
        exercises: [{
            exerciseId: {
                type: Schema.Types.ObjectId,
                ref: 'Exercise',
                required: true,
            },
            primaryFocus: {
                type: String,
            },
            intensity: {
                type: String,
                required: true,
            },
            duration: {
                type: Number,
                required: true,
            },
            sets: {
                type: Number,
                required: true,
            },
            reps: {
                type: Number,
                required: true,
            },
        }
        ],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'AdminUser',
            required: true,
        },
    },
    { timestamps: true }
);

const workoutPlanModel = mongoose.model('WorkoutPlan', workoutPlanSchema);
module.exports = workoutPlanModel;
