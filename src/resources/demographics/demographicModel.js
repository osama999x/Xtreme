const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const demographicsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
    },
    gender: {
        type: String,

    },
    age: {
        type: String, // Changed to String
    },
    height: {
        type: String, // Changed to String
    },
    weight: {
        type: String, // Changed to String
    },
}, { timestamps: true });

const Demographics = mongoose.model('Demographics', demographicsSchema);

module.exports = Demographics;
