// validators/meetingValidator.js
const Joi = require('joi');

const meetingValidator = {
    create: Joi.object({
        clientId: Joi.string().length(24).required(),
        meetingDate: Joi.date().iso().required(),
        meetingTime: Joi.string().required(),
        notes: Joi.string().optional(),
    }),

    getByClient: Joi.object({
        clientId: Joi.string().length(24).required(),
    }),

    getByAdmin: Joi.object({
        adminId: Joi.string().length(24).required(),
    }),


    updateStatus: Joi.object({
        status: Joi.string().valid('Pending', 'Confirmed', 'Cancelled').required(),
    }),

    delete: Joi.object({
        meetingId: Joi.string().length(24).required(),
    }),
};

module.exports = meetingValidator;
