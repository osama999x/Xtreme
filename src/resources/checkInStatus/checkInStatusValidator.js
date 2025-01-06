const Joi = require('joi');

const checkinStatusValidator = {
    checkin: (req, res, next) => {
        const schema = Joi.object({
            clientId: Joi.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },

    checkout: (req, res, next) => {
        const schema = Joi.object({
            clientId: Joi.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
};

module.exports = checkinStatusValidator;
