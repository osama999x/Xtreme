const FitnessQuestions = require('./fitnessQuestionaresModel');
const mongoose = require('mongoose');
const Demographics = require('../demographics/demographicModel');
class FitnessQuestionsService {
    async createFitnessQuestions(data) {
        const fitnessQuestions = new FitnessQuestions(data);
        return await fitnessQuestions.save();
    }
    async getClientDetails(clientId) {

        const result = await Demographics.aggregate([
            {
                $match: { clientId: new mongoose.Types.ObjectId(clientId) }
            },
            {
                $lookup: {
                    from: 'fitnessquestions',
                    localField: 'clientId',
                    foreignField: 'clientId',
                    as: 'fitnessQuestions'
                }
            },
            {
                $lookup: {
                    from: 'nutritionandexercisehabits',
                    localField: 'clientId',
                    foreignField: 'clientId',
                    as: 'nutritionAndExerciseHabits'
                }
            },
            {
                $project: {
                    demographics: {
                        gender: '$gender',
                        age: '$age',
                        height: '$height',
                        weight: '$weight'
                    },
                    fitnessQuestions: { $arrayElemAt: ['$fitnessQuestions', 0] },
                    nutritionAndExerciseHabits: { $arrayElemAt: ['$nutritionAndExerciseHabits', 0] }
                }
            },
            {
                $project: {
                    demographics: 1,
                    'fitnessQuestions.currentPhysicalActivityLevel': 1,
                    'fitnessQuestions.howOftenEngageInPhysicalActivity': 1,
                    'fitnessQuestions.preferredTypeOfPhysicalActivity': 1,
                    'fitnessQuestions.daysPerWeekExercise': 1,
                    'fitnessQuestions.currentDiet': 1,
                    'fitnessQuestions.howOftenEatUnhealthyFood': 1,
                    'fitnessQuestions.waterIntakePerDay': 1,
                    'fitnessQuestions.vitaminsOrSupplements': 1,
                    'fitnessQuestions.adequateSleepPerNight': 1,
                    'fitnessQuestions.medicalOrHealthConditions': 1,
                    'fitnessQuestions.injuriesOrPhysicalLimitations': 1,
                    'fitnessQuestions.goals': 1,
                    'fitnessQuestions.idealBodyWeight': 1,
                    'fitnessQuestions.healthAndFitnessGoals': 1,
                    'fitnessQuestions.commitmentLevelToGoals': 1,
                    'fitnessQuestions.currentStressLevel': 1,
                    'fitnessQuestions.stressManagement': 1,
                    'fitnessQuestions.activitiesEnjoyed': 1,
                    'fitnessQuestions.motivationToStayHealthy': 1,
                    'fitnessQuestions.gymAccess': 1,
                    'nutritionAndExerciseHabits.currentPhysicalActivityLevel': 1,
                    'nutritionAndExerciseHabits.timesEatPerDay': 1,
                    'nutritionAndExerciseHabits.currentDietType': 1,
                    'nutritionAndExerciseHabits.daysPerWeekForFitness': 1,
                    'nutritionAndExerciseHabits.involvedInAerobicExercise': 1,
                    'nutritionAndExerciseHabits.liftingWeights': 1,
                    'nutritionAndExerciseHabits.exerciseTimeCommitment': 1,
                    'nutritionAndExerciseHabits.motivationToGetInShape': 1,
                    'nutritionAndExerciseHabits.foodsToAvoid': 1,
                    'nutritionAndExerciseHabits.foodAllergies': 1,
                    'nutritionAndExerciseHabits.dietaryRestrictions': 1,
                    'nutritionAndExerciseHabits.injuriesThatCanBeWorsenedByExercise': 1,
                    'nutritionAndExerciseHabits.needMedicalClearance': 1,
                    'nutritionAndExerciseHabits.healthConditionsPreventingExercise': 1,
                    'nutritionAndExerciseHabits.prescribedMedicationsOrSupplements': 1,
                    'nutritionAndExerciseHabits.wouldLikeToExercise': 1,
                    'nutritionAndExerciseHabits.equipmentForExercising': 1
                }
            }
        ]);
        return result[0] || {};

    }
    async getFitnessQuestionsByClientId(clientId) {
        return await FitnessQuestions.findOne({ clientId });
    }

    async updateFitnessQuestions(clientId, data) {
        return await FitnessQuestions.findOneAndUpdate({ clientId }, data, { new: true });
    }

    async deleteFitnessQuestions(clientId) {
        return await FitnessQuestions.findOneAndDelete({ clientId });
    }
}

module.exports = new FitnessQuestionsService();
