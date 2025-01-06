const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    recipeName: {
        type: String,
        required: true,
    },
    calories: {
        type: Number,
        required: true,
    },
    protein: {
        type: Number,
        required: true,
    },
    fats: {
        type: Number,
        required: true,
    },
    carbs: {
        type: Number,
        required: true,
    },
    ingredients: [{
        ingredientName: {
            type: String,
            required: true,
        },
        quantity: {
            type: String, // Example: "200g", "2 cups", etc.
            required: true,
        }
    }],
    steps: [{
        stepNumber: {
            type: Number,
            required: true,
        },
        instruction: {
            type: String,
            required: true,
        },
    }],
    description: {
        type: String,

    },
    recipeImage: {
        type: String,

    },
    mealId: {
        type: Schema.Types.ObjectId,
        ref: 'Meal',
        required: false,
    },
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
