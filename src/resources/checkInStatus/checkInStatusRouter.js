const express = require('express');
const asyncHandler = require('express-async-handler');
const checkinStatusController = require('./CheckInStatusController');
const checkinStatusValidator = require('./checkInStatusValidator');

const router = express.Router();

router.post(
    '/checkin',
    asyncHandler(checkinStatusValidator.checkin),
    asyncHandler(checkinStatusController.checkin)
);

router.post(
    '/checkout',
    asyncHandler(checkinStatusValidator.checkout),
    asyncHandler(checkinStatusController.checkout)
);

router.get(
    '/history/:clientId',
    asyncHandler(checkinStatusController.getCheckinHistory)
);
router.get(
    '/history',
    asyncHandler(checkinStatusController.getHistory)
);

module.exports = router;
