const Joi = require('joi');

const bodyMetricsValidator = {
    create: (req, res, next) => {
        const schema = Joi.object({
            clientId: Joi.string().hex().length(24).required(),
            weight: Joi.number().optional(),
            waist: Joi.number().optional(),
            chest: Joi.number().optional(),
            hips: Joi.number().optional(),
            bodyFat: Joi.number().optional(),
            restingHeartRate: Joi.number().optional(),
            thigh: Joi.number().optional(),
            arm: Joi.number().optional(),
            weightLoss: Joi.number().optional(),
            muscleGain: Joi.number().optional(),
            caloriesBurned: Joi.number().optional(),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },

    update: (req, res, next) => {
        const schema = Joi.object({
            weight: Joi.number(),
            waist: Joi.number(),
            hips: Joi.number(),
            bodyFat: Joi.number(),
            weightLoss: Joi.number(),
            muscleGain: Joi.number(),
            caloriesBurned: Joi.number(),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },

    idParam: (req, res, next) => {
        const schema = Joi.object({
            id: Joi.string().hex().length(24).required(),  // ObjectId should be a 24-character hexadecimal string
        });

        const { error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
};

module.exports = bodyMetricsValidator;
