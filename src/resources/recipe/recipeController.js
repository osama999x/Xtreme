const recipeService = require('./recipeService');
const recipeValidator = require('./recipeValidator');
const uploadFile = require('../../utils/uploadFile')
const sendResponse = require('../../utils/sendResponse'); // Adjust the path as needed

const recipeController = {
    async create(req, res) {
        const { error } = recipeValidator.create.validate(req.body);
        if (error) {
            return sendResponse(res, 400, error.details[0].message);
        }

        try {
            if (req.body.recipeImage !== null && req.body.recipeImage !== '') {
                const mealImage = await uploadFile(req.body.recipeImage);
                req.body.recipeImage = mealImage;
            }
            const recipe = await recipeService.createRecipe(req.body);
            return sendResponse(res, 201, 'Recipe created successfully', recipe);
        } catch (error) {
            return sendResponse(res, 500, error.message);
        }
    },

    async update(req, res) {
        const { id } = req.params;
        const { error } = recipeValidator.update.validate(req.body);
        if (error) {
            return sendResponse(res, 400, error.details[0].message);
        }

        try {
            if (req.body.recipeImage !== null && req.body.recipeImage !== '') {
                const mealImage = await uploadFile(req.body.recipeImage);
                req.body.recipeImage = mealImage;
            }
            const updatedRecipe = await recipeService.updateRecipe(id, req.body);
            return sendResponse(res, 200, 'Recipe updated successfully', updatedRecipe);
        } catch (error) {
            return sendResponse(res, 500, error.message);
        }
    },

    async getAll(req, res) {
        try {
            const recipes = await recipeService.getAllRecipes();
            return sendResponse(res, 200, 'Recipes retrieved successfully', recipes);
        } catch (error) {
            return sendResponse(res, 500, error.message);
        }
    },

    async getById(req, res) {
        const { id } = req.params;
        const { error } = recipeValidator.getById.validate({ id });
        if (error) {
            return sendResponse(res, 400, error.details[0].message);
        }

        try {
            const recipe = await recipeService.getRecipeById(id);
            if (!recipe) {
                return sendResponse(res, 404, 'Recipe not found');
            }
            return sendResponse(res, 200, 'Recipe retrieved successfully', recipe);
        } catch (error) {
            return sendResponse(res, 500, error.message);
        }
    },

    async delete(req, res) {
        const { id } = req.params;
        const { error } = recipeValidator.getById.validate({ id });
        if (error) {
            return sendResponse(res, 400, error.details[0].message);
        }

        try {
            await recipeService.deleteRecipe(id);
            return sendResponse(res, 204, 'Recipe deleted successfully');
        } catch (error) {
            return sendResponse(res, 500, error.message);
        }
    },
};

module.exports = recipeController;
