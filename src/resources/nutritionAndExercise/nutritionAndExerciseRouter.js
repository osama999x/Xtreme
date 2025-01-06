const express = require('express');
const router = express.Router();
const NutritionAndExerciseHabitsController = require('./nutritionAndExerciseController');
const { validateNutritionAndExerciseHabits } = require('./nutritionAndExerciseValidator');

// Create a new Nutrition & Exercise Habits entry
router.post('/', validateNutritionAndExerciseHabits, NutritionAndExerciseHabitsController.create);

// Get Nutrition & Exercise Habits by clientId
router.get('/:clientId', NutritionAndExerciseHabitsController.getByClientId);

// Update Nutrition & Exercise Habits by clientId
router.put('/:clientId', validateNutritionAndExerciseHabits, NutritionAndExerciseHabitsController.update);

// Delete Nutrition & Exercise Habits by clientId
router.delete('/:clientId', NutritionAndExerciseHabitsController.delete);

module.exports = router;
