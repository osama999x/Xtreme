const Joi = require('joi');

const createFitnessQuestionsValidator = (req, res, next) => {
    const schema = Joi.object({
        clientId: Joi.string().length(24).required(),
        currentPhysicalActivityLevel: Joi.string().required(),
        howOftenEngageInPhysicalActivity: Joi.string().required(),
        preferredTypeOfPhysicalActivity: Joi.string().required(),
        daysPerWeekExercise: Joi.string().required(),
        currentDiet: Joi.string().required(),
        howOftenEatUnhealthyFood: Joi.string().required(),
        waterIntakePerDay: Joi.string().required(),
        vitaminsOrSupplements: Joi.string().required(),
        adequateSleepPerNight: Joi.string().required(),
        medicalOrHealthConditions: Joi.string().required(),
        injuriesOrPhysicalLimitations: Joi.string().required(),
        goals: Joi.string().required(),
        idealBodyWeight: Joi.string().required(),
        healthAndFitnessGoals: Joi.string().required(),
        commitmentLevelToGoals: Joi.string().required(),
        currentStressLevel: Joi.string().required(),
        stressManagement: Joi.string().required(),
        activitiesEnjoyed: Joi.string().required(),
        motivationToStayHealthy: Joi.string().required(),
        gymAccess: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};


const combinedSchema = Joi.object({
    // Demographics validation
    clientId: Joi.string().length(24).required(),
    gender: Joi.string().required(),
    age: Joi.string().required(),
    height: Joi.string().required(),
    weight: Joi.string().required(),

    // Fitness question validation
    currentPhysicalActivityLevel: Joi.string().required(),
    howOftenEngageInPhysicalActivity: Joi.string().required(),
    preferredTypeOfPhysicalActivity: Joi.string().required(),
    daysPerWeekExercise: Joi.string().required(),
    currentDiet: Joi.string().required(),
    howOftenEatUnhealthyFood: Joi.string().required(),
    waterIntakePerDay: Joi.string().required(),
    vitaminsOrSupplements: Joi.string().required(),
    adequateSleepPerNight: Joi.string().required(),
    medicalOrHealthConditions: Joi.string().required(),
    injuriesOrPhysicalLimitations: Joi.string().required(),
    goals: Joi.string().required(),
    idealBodyWeight: Joi.string().required(),
    healthAndFitnessGoals: Joi.string().required(),
    commitmentLevelToGoals: Joi.string().required(),
    currentStressLevel: Joi.string().required(),
    stressManagement: Joi.string().required(),
    activitiesEnjoyed: Joi.string().required(),
    motivationToStayHealthy: Joi.string().required(),
    gymAccess: Joi.string().required(),

    // Nutrition and exercise habits validation
    timesEatPerDay: Joi.string().required(),
    currentDietType: Joi.string().required(),
    daysPerWeekForFitness: Joi.string().required(),
    involvedInAerobicExercise: Joi.string().required(), // Changed to string
    liftingWeights: Joi.string().required(), // Changed to string
    exerciseTimeCommitment: Joi.string().required(),
    motivationToGetInShape: Joi.string().required(),
    foodsToAvoid: Joi.string().optional(),
    foodAllergies: Joi.string().optional(),
    dietaryRestrictions: Joi.string().optional(),
    injuriesThatCanBeWorsenedByExercise: Joi.string().optional(),
    needMedicalClearance: Joi.string().required(), // Changed to string
    healthConditionsPreventingExercise: Joi.string().optional(),
    prescribedMedicationsOrSupplements: Joi.string().optional(),
    wouldLikeToExercise: Joi.string().required(), // Changed to string
    equipmentForExercising: Joi.string().optional(),
});

module.exports = combinedSchema;
;
module.exports = {
    createFitnessQuestionsValidator,
    combinedSchema
};
