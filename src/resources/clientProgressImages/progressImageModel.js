const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const progressImageSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        images: [
            {
                url: {
                    type: String,
                    required: true,
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
                description: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true }
);

const ProgressImage = mongoose.model('ProgressImage', progressImageSchema);

module.exports = ProgressImage;
