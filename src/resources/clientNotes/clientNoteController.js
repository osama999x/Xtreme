const noteService = require('./clientNoteService');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');

const noteController = {
    addNote: async (req, res) => {
        const { clientId, note } = req.body;

        const newNote = await noteService.addNote(clientId, note);
        return sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Note added successfully',
            newNote
        );
    },

    getNotesByClientId: async (req, res) => {
        const { clientId } = req.params;

        const notes = await noteService.getNotesByClientId(clientId);
        if (!notes.length) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'No notes found for the client',
                []
            );
        }

        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Notes retrieved successfully',
            notes
        );
    },
};

module.exports = noteController;
