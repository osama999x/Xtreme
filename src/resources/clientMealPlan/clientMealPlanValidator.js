const Joi = require('joi');

const validateClientMealPlan = (data) => {
    const schema = Joi.object({
        clientId: Joi.string().required(),
        day: Joi.string().required(),
        date: Joi.date().required(),
        status: Joi.string().optional(),
        meals: Joi.array().items(Joi.object({
            mealId: Joi.string().required()
        })).required(),
        createdBy: Joi.string().length(24).required(),
    });

    return schema.validate(data);
};

module.exports = { validateClientMealPlan };
