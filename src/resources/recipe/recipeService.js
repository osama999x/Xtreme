const Recipe = require('./recipeModel');

const recipeService = {
    async createRecipe(data) {
        try {
            const newRecipe = new Recipe(data);
            return await newRecipe.save();
        } catch (error) {
            throw new Error('Error creating recipe');
        }
    },

    async updateRecipe(id, data) {
        try {
            return await Recipe.findByIdAndUpdate(id, data, { new: true });
        } catch (error) {
            throw new Error('Error updating recipe');
        }
    },

    async getAllRecipes() {
        try {
            return await Recipe.find();
        } catch (error) {
            throw new Error('Error retrieving recipes');
        }
    },

    async getRecipeById(id) {
        try {
            return await Recipe.findById(id);
        } catch (error) {
            throw new Error('Recipe not found');
        }
    },

    async deleteRecipe(id) {
        try {
            return await Recipe.findByIdAndDelete(id);
        } catch (error) {
            throw new Error('Error deleting recipe');
        }
    },
};

module.exports = recipeService;
