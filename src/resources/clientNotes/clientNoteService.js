const Note = require('./clientNoteModel');

const noteService = {
    addNote: async (clientId, note) => {
        const newNote = await Note.create({ clientId, note });
        return newNote;
    },

    getNotesByClientId: async (clientId) => {
        const notes = await Note.find({ clientId }).sort({ createdAt: -1 });
        return notes;
    },
};

module.exports = noteService;
