const Joi = require('joi');

const noteValidator = {
    add: (req, res, next) => {
        const schema = Joi.object({
            clientId: Joi.string().required(),
            note: Joi.string().min(1).max(500).required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
};

module.exports = noteValidator;
