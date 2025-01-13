const asyncHandler = require('express-async-handler');
const mealServices = require('./mealService');
const sendResponse = require('../../utils/sendResponse');
const mealValidator = require('./mealValidator');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const uploadFile = require('../../utils/uploadFile');

const mealController = {


    createMealWithRecipes: asyncHandler(async (req, res) => {
        const { error } = mealValidator.createMealValidator.validate(req.body);
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }

        const { mealName, mealType, recipes } = req.body;

        if (recipes && recipes.recipeImage) {
            recipes.recipeImage = await uploadFile(recipes.recipeImage);
        }

        const { meal, createdRecipes } = await mealServices.createMealWithRecipes({ mealName, mealType }, recipes);
        return sendResponse(res, responseStatusCodes.CREATED, 'Meal and recipes created successfully', { meal, createdRecipes });
    }),

    updateMealAndRecipes: asyncHandler(async (req, res) => {

        const { error } = mealValidator.updateMealValidator.validate(req.body);
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }

        const { mealName, mealType, recipeIds, recipes } = req.body;
        const { mealId } = req.params;

        try {
            const updatedMeal = await mealServices.updateMealAndRecipes(mealId, { mealName, mealType }, recipeIds, recipes);

            return sendResponse(res, responseStatusCodes.OK, 'Meal and recipes updated successfully', updatedMeal);
        } catch (err) {
            return sendResponse(res, responseStatusCodes.SERVER, err.message);
        }
    }),


    createMealWithPreExistingRecipes: asyncHandler(async (req, res) => {
        const { error } = mealValidator.createMealWithRecipeIdsValidator.validate(req.body);
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }

        const { mealName, mealType, recipeIds } = req.body;
        const { meal, recipes } = await mealServices.createMealWithPreExistingRecipes({ mealName, mealType }, recipeIds);
        return sendResponse(res, responseStatusCodes.CREATED, 'Meal created and associated with pre-existing recipes successfully', { meal, recipes });
    }),

    createMeal: asyncHandler(async (req, res) => {
        const validationResult = mealValidator.createMealValidator.validate(req.body);
        if (validationResult.error) {
            return sendResponse(res, responseStatusCodes.BAD, validationResult.error.details[0].message);
        }

        const meal = await mealServices.createMealWithRecipes(req.body);
        return sendResponse(res, responseStatusCodes.CREATED, 'Meal created successfully', meal);
    }),

    updateMeal: asyncHandler(async (req, res) => {
        const validationResult = mealValidator.update.validate(req.body);
        if (validationResult.error) {
            return sendResponse(res, responseStatusCodes.BAD, validationResult.error.details[0].message);
        }

        const updatedMeal = await mealServices.update(req.params.id, req.body);
        if (updatedMeal) {
            return sendResponse(res, responseStatusCodes.OK, 'Meal updated successfully', updatedMeal);
        } else {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal not found');
        }
    }),

    getAllMeals: asyncHandler(async (req, res) => {
        const meals = await mealServices.getAll();
        return sendResponse(res, responseStatusCodes.OK, 'Meals retrieved successfully', meals);
    }),

    getMealById: asyncHandler(async (req, res) => {
        const validationResult = mealValidator.getById.validate(req.params);
        if (validationResult.error) {
            return sendResponse(res, responseStatusCodes.BAD, validationResult.error.details[0].message);
        }

        const meal = await mealServices.getMealWithRecipes(req.params.id);
        if (!meal) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal not found');
        }

        return sendResponse(res, responseStatusCodes.OK, 'Meal retrieved successfully', meal);
    }),

    deleteMeal: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deleted = await mealServices.deleteMeal(id);
        if (!deleted) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Meal deleted successfully');
    }),
};

module.exports = mealController;
