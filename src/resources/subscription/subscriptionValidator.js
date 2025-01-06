const Joi = require('joi');

const validateSubscription = (data) => {
    const schema = Joi.object({
        clientId: Joi.string().required(),
        planType: Joi.string().valid('Silver', 'Gold', 'Platinum').required(),
        customerData: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().optional(),
            phone: Joi.string().optional(),
        }).required()
    });
    return schema.validate(data);
};

module.exports = {
    validateSubscription,
};
