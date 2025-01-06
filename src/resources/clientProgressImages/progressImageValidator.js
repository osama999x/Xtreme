const Joi = require('joi');

const progressImageValidator = {
    upload: (req, res, next) => {
        const schema = Joi.object({
            clientId: Joi.string().required(),
            images: Joi.array().items(
                Joi.object({
                    fileData: Joi.string().required(), // Base64 encoded file data
                    description: Joi.string().optional(),
                })
            ).required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },

    getImages: (req, res, next) => {
        const schema = Joi.object({
            clientId: Joi.string().required(),
            date: Joi.date().optional(),
            week: Joi.date().optional(),
        }).xor('date', 'week'); // Only one of date or week should be present
        const { error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
};

module.exports = progressImageValidator;
