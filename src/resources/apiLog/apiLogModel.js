const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        url: {
            type: String,
        },
        requestType: {
            type: String,
        },
        request: {
            type: Object,
        },
        response: {
            type: Object,
        },
        message: {
            type: String,
        },
        responseCode: {
            type: Number,
        },
    },
    { timestamps: true }
);

const apiLogModel = new mongoose.model('ApiLogModel', schema);
module.exports = apiLogModel;
