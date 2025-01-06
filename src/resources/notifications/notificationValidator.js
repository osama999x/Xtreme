const Joi = require('joi');

const notificationValidator = {
    create: Joi.object({
        title: Joi.string().required(),
        body: Joi.string().required(),
        message: Joi.string().required(),
        clientId: Joi.string().optional(),
        adminId: Joi.string().optional(),
    }),
    getById: Joi.object({
        id: Joi.string().required(),
    }),
};

module.exports = notificationValidator;
