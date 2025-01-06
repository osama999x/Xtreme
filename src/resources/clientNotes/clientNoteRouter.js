const express = require('express');
const asyncHandler = require('express-async-handler');
const noteController = require('./clientNoteController');
const noteValidator = require('./clientNoteValidator');

const router = express.Router();

// Add a note
router.post(
    '/add',
    asyncHandler(noteValidator.add),
    asyncHandler(noteController.addNote)
);

// Get notes by client ID
router.get(
    '/client/:clientId',
    asyncHandler(noteController.getNotesByClientId)
);

module.exports = router;
