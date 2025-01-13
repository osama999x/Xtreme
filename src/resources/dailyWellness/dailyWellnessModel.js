const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyWellnessSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        hydrationLevel: {
            type: String,
        },
        stepsCount: {
            type: String,
        },
        sleepQuality: {
            type: String,
        },
        energyLevel: {
            type: String,
        },
        restingHeartRate: {
            type: String,
        },
        completedWorkout: {
            type: String,
        },
        completedMeal: {
            type: String,
        },
        mentalClarity: {
            type: String,
        },
        metabolism: {
            type: String,
        },
        skin: {
            type: String,
        },
        workouts: {
            type: String,
        },
        calories: {
            type: String,
        },
        glasses: {
            type: String,
        },
        heartRate: {
            type: String,
        },

    },
    { timestamps: true }
);

const DailyWellness = mongoose.model('DailyWellness', dailyWellnessSchema);

module.exports = DailyWellness;
