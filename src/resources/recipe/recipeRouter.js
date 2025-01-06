const express = require('express');
const recipeController = require('./recipeController');

const recipeRouter = express.Router();

recipeRouter.post('/', recipeController.create); // Create a new recipe
recipeRouter.put('/:id', recipeController.update); // Update a recipe by ID
recipeRouter.get('/', recipeController.getAll); // Get all recipes
recipeRouter.get('/:id', recipeController.getById); // Get a specific recipe by ID
recipeRouter.delete('/:id', recipeController.delete); // Delete a recipe by ID

module.exports = recipeRouter;
