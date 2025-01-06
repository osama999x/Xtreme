const Joi = require('joi');

// Define validation schema
const nutritionAndExerciseHabitsSchema = Joi.object({
    clientId: Joi.string().length(24).required(),
    currentPhysicalActivityLevel: Joi.string().required(),
    timesEatPerDay: Joi.number().required(),
    currentDietType: Joi.string().required(),
    daysPerWeekForFitness: Joi.number().required(),
    involvedInAerobicExercise: Joi.boolean().required(),
    liftingWeights: Joi.boolean().required(),
    exerciseTimeCommitment: Joi.string().required(),
    motivationToGetInShape: Joi.string().required(),
    foodsToAvoid: Joi.string().optional(),
    foodAllergies: Joi.string().optional(),
    dietaryRestrictions: Joi.string().optional(),
    injuriesThatCanBeWorsenedByExercise: Joi.string().optional(),
    needMedicalClearance: Joi.boolean().required(),
    healthConditionsPreventingExercise: Joi.string().optional(),
    prescribedMedicationsOrSupplements: Joi.string().optional(),
    wouldLikeToExercise: Joi.boolean().required(),
    equipmentForExercising: Joi.string().optional(),
});

// Validation middleware
const validateNutritionAndExerciseHabits = (req, res, next) => {
    const { error } = nutritionAndExerciseHabitsSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validateNutritionAndExerciseHabits,
};
