const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fitnessQuestionsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
    },
    currentPhysicalActivityLevel: {
        type: String,
    },
    howOftenEngageInPhysicalActivity: {
        type: String,
    },
    preferredTypeOfPhysicalActivity: {
        type: String,
    },
    daysPerWeekExercise: {
        type: String,
    },
    currentDiet: {
        type: String,
    },
    howOftenEatUnhealthyFood: {
        type: String,
    },
    waterIntakePerDay: {
        type: String,
    },
    vitaminsOrSupplements: {
        type: String,
    },
    adequateSleepPerNight: {
        type: String,
    },
    medicalOrHealthConditions: {
        type: String,
    },
    injuriesOrPhysicalLimitations: {
        type: String,
    },
    goals: {
        type: String,
    },
    idealBodyWeight: {
        type: String,
    },
    healthAndFitnessGoals: {
        type: String,
    },
    commitmentLevelToGoals: {
        type: String,
    },
    currentStressLevel: {
        type: String,
    },
    stressManagement: {
        type: String,
    },
    activitiesEnjoyed: {
        type: String,
    },
    motivationToStayHealthy: {
        type: String,
    },
    gymAccess: {
        type: String,
    },
}, { timestamps: true });

const FitnessQuestions = mongoose.model('FitnessQuestions', fitnessQuestionsSchema);

module.exports = FitnessQuestions;
