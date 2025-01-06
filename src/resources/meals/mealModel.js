const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mealSchema = new Schema({
    mealName: {
        type: String,
        required: true,
    },
    mealType: {
        type: String,
        // enum: ['Macro-Based', 'Calorie-Based', 'Custom'],
        required: true,
    },
    totalCalories: {
        type: Number,
        default: 0,
    },
    totalProtein: {
        type: Number,
        default: 0,
    },
    totalFats: {
        type: Number,
        default: 0,
    },
    totalCarbs: {
        type: Number,
        default: 0,
    },
    totalMeals: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });



const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
