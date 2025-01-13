const mongoose = require('mongoose');
const Client = require('../clients/clientModel.js')
const clientMealPlanModel = require('../clientMealPlan/clientMealPlanModel.js')
const workoutPlanModel = require('../workout/workoutPlanModel.js')
const subscriptionSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    planType: {
        type: String,
        enum: ['Silver', 'Gold', 'Platinum'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    durationMonths: {
        type: Number,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    payment: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Expired', 'OnGoing'],
    }
});



const Subscription = mongoose.model('Subscription', subscriptionSchema);

// const updateSubscriptionStatuses = async () => {
//     const currentDate = new Date();

//     await Subscription.updateMany(
//         { expirationDate: { $lte: currentDate } },
//         { status: 'Expired' }
//     );


//     // await Subscription.updateMany(
//     //     { expirationDate: { $gte: currentDate } },
//     //     { status: 'OnGoing' }
//     // );

//     const workoutPlan = await workoutPlanModel.findOne({ date: { $lte: currentDate } })
//     await Client.updateMany(
//         {
//             workoutPlanStatusEndDate: { $lte: currentDate },
//         },
//         {
//             workoutPlanStatus: 'Not Requested',
//             workoutPlanStatusStartDate: null,
//             workoutPlanStatusEndDate: null,
//         }
//     );

//     const clientMealPlan = await clientMealPlanModel.findOne({ date: { $lte: currentDate } })
//     await Client.updateMany(
//         {
//             mealPlanStatusEndDate: { $lt: currentDate },
//         },
//         {
//             mealPlanStatus: 'Not Requested',
//             mealPlanStatusStartDate: null,
//             mealPlanStatusEndDate: null,
//         }
//     );

//     console.log('Subscription and client statuses updated where necessary.');
// };
const updateSubscriptionStatuses = async () => {
    const currentDate = new Date();

    await Subscription.updateMany(
        { expirationDate: { $lte: currentDate } },
        { status: 'Expired' }
    );


    const latestWorkoutPlans = await workoutPlanModel.aggregate([
        { $match: { date: { $lte: currentDate } } },
        { $sort: { date: -1 } },
        {
            $group: {
                _id: '$clientId',
                lastPlan: { $first: '$$ROOT' },
            },
        },
    ]);

    for (const { _id: clientId, lastPlan } of latestWorkoutPlans) {
        await Client.updateOne(
            { _id: clientId },
            {
                workoutPlanStatus: 'Not Requested',
                workoutPlanStatusStartDate: null,
                workoutPlanStatusEndDate: null,
            }
        );
    }

    const latestMealPlans = await clientMealPlanModel.aggregate([
        { $match: { date: { $lte: currentDate } } },
        { $sort: { date: -1 } },
        {
            $group: {
                _id: '$clientId',
                lastPlan: { $first: '$$ROOT' },
            },
        },
    ]);

    for (const { _id: clientId, lastPlan } of latestMealPlans) {
        await Client.updateOne(
            { _id: clientId },
            {
                mealPlanStatus: 'Not Requested',
                mealPlanStatusStartDate: null,
                mealPlanStatusEndDate: null,
            }
        );
    }

    console.log('Subscription and client statuses updated where necessary.');
};

module.exports = { Subscription, updateSubscriptionStatuses };
