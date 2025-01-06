const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        primaryFocus: {
            type: String,
            required: true,
        },
        movementPattern: {
            type: String,
            required: true,
        },
        equipment: {
            type: String,
            required: false,
        },

        videoLink: {
            type: String,
            required: false,
        },
        steps: [
            {
                stepNumber: { type: Number, required: true }, // Step number (1, 2, 3, ...)
                instruction: { type: String, required: true }, // Step instruction
            },
        ],
        picture: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

const exerciseModel = mongoose.model('Exercise', exerciseSchema);
module.exports = exerciseModel;
