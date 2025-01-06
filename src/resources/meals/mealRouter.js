const express = require('express');
const mealController = require('./mealController');
const mealRouter = express.Router();

mealRouter
    .route('/')
    .post(mealController.createMealWithRecipes)
    .get(mealController.getAllMeals);

mealRouter
    .route('/:id')
    .get(mealController.getMealById)
    .delete(mealController.deleteMeal);
mealRouter.post('/mealWithRecipes', mealController.createMealWithRecipes);
mealRouter.put('/update/:id', mealController.updateMeal);
mealRouter.put('/:mealId', mealController.updateMealAndRecipes);

module.exports = mealRouter;
