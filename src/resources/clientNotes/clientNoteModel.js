const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        note: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
