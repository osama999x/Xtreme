const express = require('express');
const asyncHandler = require('express-async-handler');
const progressImageController = require('./progressImageController');
const progressImageValidator = require('./progressImageValidator');

const router = express.Router();

router.post(
    '/upload',
    asyncHandler(progressImageValidator.upload),
    asyncHandler(progressImageController.uploadProgressImages)
);

router.get(
    '/images',
    asyncHandler(progressImageValidator.getImages),
    asyncHandler(progressImageController.getProgressImages)
);

module.exports = router;
