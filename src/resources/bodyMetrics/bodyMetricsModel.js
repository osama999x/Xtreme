const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bodyMetricsSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        weight: {
            type: Number,

        },
        waist: {
            type: Number,

        },
        hips: {
            type: Number,

        },
        bodyFat: {
            type: Number,

        },
        thigh: {
            type: Number,

        }, arm: {
            type: Number,

        },
        weightLoss: {
            type: Number,

        },
        muscleGain: {
            type: Number,

        },
        caloriesBurned: {
            type: Number,

        },
        chest: {
            type: Number,
        }
    },
    { timestamps: true }
);

const BodyMetrics = mongoose.model('BodyMetrics', bodyMetricsSchema);

module.exports = BodyMetrics;
