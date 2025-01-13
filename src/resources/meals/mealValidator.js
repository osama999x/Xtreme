const Joi = require('joi');

// Define recipeSchema before using it
const recipeSchema = Joi.object({
    recipeName: Joi.string().required(),
    calories: Joi.number().required(),
    protein: Joi.number().required(),
    fats: Joi.number().required(),
    carbs: Joi.number().required(),
    ingredients: Joi.array().items(
        Joi.object({
            ingredientName: Joi.string().required(),
            quantity: Joi.string().required(), // e.g., "200g", "2 cups"
        })
    ).min(1).required(),
    steps: Joi.array().items(
        Joi.object({
            stepNumber: Joi.number().required(),
            instruction: Joi.string().required(),
        })
    ).min(1).required(),
    description: Joi.string().optional(),
    recipeImage: Joi.string().optional(),
});

const mealValidator = {
    createMealValidator: Joi.object({
        mealName: Joi.string().required(),
        mealType: Joi.string().required(),
        recipes: Joi.array().items(recipeSchema).min(1).required(),
    }),
    createMealWithRecipeIdsValidator: Joi.object({
        mealName: Joi.string().required(),
        mealType: Joi.string().required(),
        recipeIds: Joi.array().items(Joi.string().length(24).required()).min(1).required(),
    }),
    updateMealValidator: Joi.object({
        mealName: Joi.string().optional(),
        mealType: Joi.string().optional(),
        recipeIds: Joi.array().items(Joi.string().length(24).optional()).min(1).optional(),
        recipes: Joi.array().items(
            Joi.object({
                _id: Joi.string().length(24).required(), // Recipe ID to update
                recipeName: Joi.string().optional(),
                calories: Joi.number().optional(),
                protein: Joi.number().optional(),
                fats: Joi.number().optional(),
                carbs: Joi.number().optional(),
                ingredients: Joi.array().items(
                    Joi.object({
                        ingredientName: Joi.string().required(),
                        quantity: Joi.string().required(),
                    })
                ).optional(),
                steps: Joi.array().items(
                    Joi.object({
                        stepNumber: Joi.number().required(),
                        instruction: Joi.string().required(),
                    })
                ).optional(),
                description: Joi.string().optional(),
                recipeImage: Joi.string().optional(),
            })
        ).optional(),
    }),
    create: Joi.object({
        mealName: Joi.string().required(),
        mealType: Joi.string().required(),
    }),
    update: Joi.object({
        mealName: Joi.string().trim().optional(),
        mealType: Joi.string().optional(),
        totalCalories: Joi.number().min(0).optional(),
        totalProtein: Joi.number().min(0).optional(),
        totalFats: Joi.number().min(0).optional(),
        totalCarbs: Joi.number().min(0).optional(),
        totalMeals: Joi.number().integer().min(0).optional()
    }),
    getById: Joi.object({
        id: Joi.string().length(24).required(),
    }),
};

module.exports = mealValidator;
