const Joi = require('joi');

const exerciseValidator = Joi.object({
    name: Joi.string().required(),
    primaryFocus: Joi.string().required(),
    intensity: Joi.string().required(),
    duration: Joi.number().required(),
    sets: Joi.number().required(),
    reps: Joi.number().required(),
    movementPattern: Joi.string().required(),
    equipment: Joi.string().optional(),
    steps: Joi.array().items(
        Joi.object({
            stepNumber: Joi.number().required(),
            instruction: Joi.string().required(),
        })
    ).optional(),
    picture: Joi.string().optional(),
});

const workoutPlanValidator = {
    create: Joi.object({
        clientId: Joi.string().length(24).required(),
        day: Joi.string().required(),
        date: Joi.date().required(),
        status: Joi.string().optional(),
        period: Joi.string().valid('Weekly', 'Monthly', 'Daily').optional(),
        exercises: Joi.array().items(
            Joi.object({
                exerciseId: Joi.string().length(24).required(),
                intensity: Joi.string().required(),
                duration: Joi.number().required(),
                sets: Joi.number().required(),
                reps: Joi.number().required(),
                primaryFocus: Joi.string().required(),
            })
        ).min(1).required(),
        createdBy: Joi.string().length(24).required(),
    }),

    update: Joi.object({
        day: Joi.string().optional(),
        date: Joi.date().optional(),
        period: Joi.string().valid('Weekly', 'Monthly', 'Daily').optional(),
        exercises: Joi.array().items(
            Joi.object({
                exerciseId: Joi.string().length(24).required(),
                intensity: Joi.string().optional(),
                duration: Joi.number().optional(),
                sets: Joi.number().optional(),
                reps: Joi.number().optional(),
            })
        ).optional(),
    }),

    getById: Joi.object({
        id: Joi.string().length(24).required(),
    }),


    exerciseValidator,

    saveGpt: Joi.object({
        clientId: Joi.string().length(24).required(),
        day: Joi.string().required(),
        date: Joi.date().required(),
        period: Joi.string().valid('Weekly', 'Monthly', 'Daily').optional(),
        exercises: Joi.array().items(exerciseValidator).min(1).required(),
        createdBy: Joi.string().length(24).required(),
    }),
};

module.exports = workoutPlanValidator;
