const NutritionAndExerciseHabits = require('./nutritionAndExerciseModel');

class NutritionAndExerciseHabitsService {
    // Create a new Nutrition & Exercise Habits entry
    async create(data) {
        const newEntry = new NutritionAndExerciseHabits(data);
        return await newEntry.save();
    }

    // Get Nutrition & Exercise Habits by clientId
    async getByClientId(clientId) {
        return await NutritionAndExerciseHabits.findOne({ clientId });
    }

    // Update Nutrition & Exercise Habits by clientId
    async update(clientId, data) {
        return await NutritionAndExerciseHabits.findOneAndUpdate({ clientId }, data, { new: true });
    }

    // Delete Nutrition & Exercise Habits by clientId
    async delete(clientId) {
        return await NutritionAndExerciseHabits.findOneAndDelete({ clientId });
    }
}

module.exports = new NutritionAndExerciseHabitsService();
