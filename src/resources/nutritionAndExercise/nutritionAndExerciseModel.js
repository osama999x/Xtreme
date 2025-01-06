const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nutritionAndExerciseHabitsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
    },
    currentPhysicalActivityLevel: {
        type: String,
    },
    timesEatPerDay: {
        type: String,
    },
    currentDietType: {
        type: String,
    },
    daysPerWeekForFitness: {
        type: String,
    },
    involvedInAerobicExercise: {
        type: String,
    },
    liftingWeights: {
        type: String,
    },
    exerciseTimeCommitment: {
        type: String,
    },
    motivationToGetInShape: {
        type: String,
    },
    foodsToAvoid: {
        type: String,
        required: false,
    },
    foodAllergies: {
        type: String,
        required: false,
    },
    dietaryRestrictions: {
        type: String,
        required: false,
    },
    injuriesThatCanBeWorsenedByExercise: {
        type: String,
        required: false,
    },
    needMedicalClearance: {
        type: String,
    },
    healthConditionsPreventingExercise: {
        type: String,
        required: false,
    },
    prescribedMedicationsOrSupplements: {
        type: String,
        required: false,
    },
    wouldLikeToExercise: {
        type: String,
    },
    equipmentForExercising: {
        type: String,
        required: false,
    },
}, { timestamps: true });

const NutritionAndExerciseHabits = mongoose.model('NutritionAndExerciseHabits', nutritionAndExerciseHabitsSchema);

module.exports = NutritionAndExerciseHabits;
