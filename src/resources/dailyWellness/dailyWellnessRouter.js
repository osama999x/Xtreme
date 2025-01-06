const express = require('express');
const asyncHandler = require('express-async-handler');
const dailyWellnessController = require('./dailyWellnessController');
const dailyWellnessValidator = require('./dailyWellnessValidator');

const router = express.Router();

router.post(
    '/',
    asyncHandler(dailyWellnessValidator.create),
    asyncHandler(dailyWellnessController.create)
);

router.put(
    '/:id',
    asyncHandler(dailyWellnessValidator.idParam),
    asyncHandler(dailyWellnessValidator.update),
    asyncHandler(dailyWellnessController.update)
);

router.delete(
    '/:id',
    asyncHandler(dailyWellnessValidator.idParam),
    asyncHandler(dailyWellnessController.delete)
);

router.get(
    '/:id',
    asyncHandler(dailyWellnessValidator.idParam),
    asyncHandler(dailyWellnessController.getById)
);

router.get(
    '/client/:clientId',
    asyncHandler(dailyWellnessController.getAllByClient)
);

module.exports = router;
