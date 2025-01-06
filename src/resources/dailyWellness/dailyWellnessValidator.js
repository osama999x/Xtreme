const Joi = require('joi');

const dailyWellnessValidator = {
    create: (req, res, next) => {
        const schema = Joi.object({
            clientId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/), // Ensure valid ObjectId format
            hydrationLevel: Joi.number().optional(),
            stepsCount: Joi.number().optional(),
            sleepQuality: Joi.number().optional(),
            energyLevel: Joi.number().optional(),
            restingHeartRate: Joi.number().optional(),
            completedWorkout: Joi.number().optional(),
            completedMeal: Joi.number().optional(),
            mentalClarity: Joi.number().optional(),
            metabolism: Joi.number().optional(),
            skin: Joi.number().optional(),
            workouts: Joi.string()
                .valid('Completed', 'Not Completed')
                .optional()
                .messages({
                    'any.only': 'workouts must be either "Completed" or "Not Completed".',
                }),

            clientMealPlan: Joi.string()
                .valid('Completed', 'Not Completed')
                .optional()
                .messages({
                    'any.only': 'clientMealPlan must be either "Completed" or "Not Completed".',
                }),
            calories: Joi.number().optional(),
            glasses: Joi.number().optional(),
            date: Joi.string().optional(),
            heartRate: Joi.number().optional(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },

    update: (req, res, next) => {
        const schema = Joi.object({
            hydrationLevel: Joi.string().optional(),
            stepsCount: Joi.string().optional(),
            sleepQuality: Joi.string().optional(),
            energyLevel: Joi.string().optional(),
            restingHeartRate: Joi.string().optional(),
            completedWorkout: Joi.string().optional(),
            completedMeal: Joi.string().optional(),
            mentalClarity: Joi.string().optional(),
            metabolism: Joi.string().optional(),
            skin: Joi.string().optional(),
            workouts: Joi.string().optional(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },

    idParam: (req, res, next) => {
        const schema = Joi.object({
            id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/), // Ensure valid ObjectId format
        });
        const { error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
};

module.exports = dailyWellnessValidator;
