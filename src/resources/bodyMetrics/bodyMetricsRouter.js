const express = require('express');
const asyncHandler = require('express-async-handler');
const bodyMetricsController = require('./bodyMetricsController');
const bodyMetricsValidator = require('./bodyMetricsValidator');

const router = express.Router();


router.post(
    '/',
    asyncHandler(bodyMetricsValidator.create),
    asyncHandler(bodyMetricsController.create)
);

router.put(
    '/:id',
    asyncHandler(bodyMetricsValidator.idParam),
    asyncHandler(bodyMetricsValidator.update),
    asyncHandler(bodyMetricsController.update)
);

router.delete(
    '/:id',
    asyncHandler(bodyMetricsValidator.idParam),
    asyncHandler(bodyMetricsController.delete)
);

router.get(
    '/:id',
    asyncHandler(bodyMetricsValidator.idParam),
    asyncHandler(bodyMetricsController.getById)
);

router.get(
    '/client/:clientId',
    asyncHandler(bodyMetricsController.getAllByClient)
);

module.exports = router;
