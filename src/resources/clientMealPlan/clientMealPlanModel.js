const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const clientMealPlanSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    day: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,

    },
    meals: [
        {
            mealId: {
                type: Schema.Types.ObjectId,
                ref: 'Meal',
                required: true,
            },
        },
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true,
    },
}, { timestamps: true });

const ClientMealPlan = mongoose.model('ClientMealPlan', clientMealPlanSchema);

module.exports = ClientMealPlan;
