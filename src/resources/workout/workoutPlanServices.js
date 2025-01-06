const workoutPlanModel = require('./workoutPlanModel');
const mongoose = require('mongoose');
const Client = require('../clients/clientModel')


const workoutPlanServices = {
    create: async (data) => {
        return await workoutPlanModel.create(data);
    },
    getAllByClient: async (clientId, date) => {
        try {
            let matchStage = {};

            // Check for clientId and date together
            if (clientId && date) {
                const startDate = new Date(date);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);

                matchStage = {
                    clientId: new mongoose.Types.ObjectId(clientId),
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                };
            }
            // Only clientId
            else if (clientId) {
                matchStage = { clientId: new mongoose.Types.ObjectId(clientId) };
            }
            // Only date
            else if (date) {
                const startDate = new Date(date);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);

                matchStage = {
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                };
            } else {
                throw new Error('Either clientId or date must be provided');
            }

            const workoutPlans = await workoutPlanModel.aggregate([
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'exercises',
                        localField: 'exercises.exerciseId',
                        foreignField: '_id',
                        as: 'exerciseDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'meals',
                        localField: 'meals.mealId',
                        foreignField: '_id',
                        as: 'mealDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'adminusers',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'adminDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$adminDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        day: 1,
                        date: 1,
                        period: 1,
                        startDate: 1,
                        endDate: 1,
                        status: 1,
                        exercises: {
                            $map: {
                                input: '$exercises',
                                as: 'exercise',
                                in: {
                                    exerciseId: '$$exercise.exerciseId',
                                    intensity: '$$exercise.intensity',
                                    duration: '$$exercise.duration',
                                    sets: '$$exercise.sets',
                                    reps: '$$exercise.reps',
                                    primaryFocus: '$$exercise.primaryFocus',
                                    exerciseDetails: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$exerciseDetails',
                                                    as: 'detail',
                                                    cond: { $eq: ['$$detail._id', '$$exercise.exerciseId'] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                }
                            }
                        },

                        createdBy: 1,
                        adminName: {
                            $concat: [
                                { $ifNull: ['$adminDetails.firstName', ''] },
                                ' ',
                                { $ifNull: ['$adminDetails.lastName', ''] }
                            ]
                        },
                        mealDetails: {
                            $map: {
                                input: '$mealDetails',
                                as: 'meal',
                                in: {
                                    mealType: '$$meal.mealType',
                                    meals: '$$meal.meals'
                                }
                            }
                        }
                    }
                }
            ]);

            return workoutPlans;
        } catch (error) {
            throw new Error(`Error fetching workout plans: ${error.message}`);
        }
    }

    , getByClientAndDate: async (clientId, date) => {
        try {

            return await workoutPlanModel.findOne({ clientId, date });
        } catch (error) {
            console.error('Error fetching workout plan by client and date:', error);
            throw new Error('Could not fetch workout plan');
        }
    }
    ,
    update: async (id, data) => {
        return await workoutPlanModel.findByIdAndUpdate(id, data, { new: true });
    },
    delete: async (id) => {
        return await workoutPlanModel.findByIdAndDelete(id);
    },
    getById: async (id) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid ID format');
            }

            const workoutPlan = await workoutPlanModel.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(id) }
                },
                {
                    $lookup: {
                        from: 'exercises',
                        localField: 'exercises.exerciseId',
                        foreignField: '_id',
                        as: 'exerciseDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'meals',
                        localField: 'meals.mealId',
                        foreignField: '_id',
                        as: 'mealDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'adminusers', // Join with the admin users collection
                        localField: 'createdBy', // The field in workoutPlan
                        foreignField: '_id', // The field in adminusers
                        as: 'adminDetails' // Alias for the joined data
                    }
                },
                {
                    $unwind: {
                        path: '$adminDetails', // Unwind the admin details
                        preserveNullAndEmptyArrays: true // Keep workoutPlan even if no admin is found
                    }
                },
                {
                    $project: {
                        _id: 1,
                        clientId: 1,
                        day: 1,
                        date: 1,
                        period: 1,
                        primaryFocus: 1,
                        intensity: 1,
                        duration: 1,
                        sets: 1,
                        reps: 1,
                        createdBy: 1,
                        status: 1,
                        adminName: {
                            $concat: [
                                { $ifNull: ['$adminDetails.firstName', ''] },
                                ' ',
                                { $ifNull: ['$adminDetails.lastName', ''] }
                            ]
                        },
                        exerciseDetails: {
                            $map: {
                                input: '$exerciseDetails',
                                as: 'exercise',
                                in: {
                                    _id: '$$exercise._id',
                                    name: '$$exercise.name',
                                    primaryFocus: '$$exercise.primaryFocus',
                                    movementPattern: '$$exercise.movementPattern',
                                    equipment: '$$exercise.equipment',
                                    videoLink: '$$exercise.videoLink',
                                    steps: {
                                        $map: {
                                            input: '$$exercise.steps',
                                            as: 'step',
                                            in: {
                                                stepNumber: '$$step.stepNumber',
                                                instruction: '$$step.instruction'
                                            }
                                        }
                                    },
                                    picture: '$$exercise.picture'
                                }
                            }
                        },
                        mealDetails: {
                            $map: {
                                input: '$mealDetails',
                                as: 'meal',
                                in: {
                                    _id: '$$meal._id',
                                    mealType: '$$meal.mealType',
                                    meals: '$$meal.meals'
                                }
                            }
                        },
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]);

            if (workoutPlan.length === 0) {
                throw new Error('Workout plan not found');
            }

            return workoutPlan[0];
        } catch (error) {
            throw new Error(`Error fetching workout plan: ${error.message}`);
        }
    }
    ,
    updateWorkoutPlanStatus: async (clientId, date, status) => {


        try {
            console.log('clientId', clientId)
            console.log('date', date)
            console.log('status', status)
            const workoutPlan = await workoutPlanModel.findOne({
                clientId,
                date: new Date(date),
            });

            if (!workoutPlan) {
                console.log('Workout plan not found for the given date and clientId.');
                return null;
            }

            workoutPlan.status = status;
            await workoutPlan.save();

            const client = await Client.findById(clientId);
            if (client) {
                const workoutPlansInRange = await workoutPlanModel.find({ clientId });
                const allCompleted = workoutPlansInRange.every(plan => plan.status && plan.status === 'Not Completed' && plan.status === 'Completed');

                if (allCompleted) {
                    client.workoutPlanStatus = 'Not Requested';
                    client.workoutPlanStatusStartDate = null;
                    client.workoutPlanStatusEndDate = null;
                } else {
                    client.workoutPlanStatus = 'Assigned';
                }

                await client.save();
            }

            return workoutPlan;
        } catch (error) {
            console.error('Error updating workout plan status:', error);
            throw new Error('Internal server error');
        }
    }
};

module.exports = workoutPlanServices;
