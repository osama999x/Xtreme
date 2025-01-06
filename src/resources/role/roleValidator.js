const Joi = require('joi');

const adminRoleValidator = {
    create: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional(),
    }),
    update: Joi.object({
        roleId: Joi.string().length(24).required(),
        name: Joi.string().optional(),
        description: Joi.string().optional(),
    }),
    getById: Joi.object({
        id: Joi.string().length(24).required(),
    }),
};

module.exports = adminRoleValidator;
