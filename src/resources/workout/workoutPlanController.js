const asyncHandler = require('express-async-handler');
const workoutPlanServices = require('./workoutPlanServices');
const sendResponse = require('../../utils/sendResponse');
const workoutPlanValidator = require('./workoutPlanValidator');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const clientServices = require('../clients/clientService')
const Notification = require('../notifications/notificationService');
const adminUserModel = require('../adminUser/adminUserModel')
const systemNotificationServices = require('../systemNotifications/systemNotification')
const WorkoutPlan = require('./workoutPlanModel')
const NutritionAndExerciseHabits = require('../nutritionAndExercise/nutritionAndExerciseModel');
const FitnessQuestions = require('../fitnessQuestionares/fitnessQuestionaresModel');
const Demographics = require('../demographics/demographicModel');
const getChatGPTResponse = require('../../utils/gpt');
const exerciseModel = require('../exercise/exerciseModel')
const Client = require('../clients/clientModel')

const workoutPlanController = {
    createWorkoutPlan: asyncHandler(async (req, res) => {
        const validationResult = workoutPlanValidator.create.validate(req.body);
        if (validationResult.error) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const { clientId, createdBy, date, exercises, day, period, status } = req.body;

        const client = await clientServices.getById(clientId);
        if (!client) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Client not found',
                null,
                req.logId
            );
        }

        const admin = await adminUserModel.findById(createdBy);
        if (!admin) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Admin not found',
                null,
                req.logId
            );
        }


        let workoutPlan = await workoutPlanServices.getByClientAndDate(clientId, date);

        if (workoutPlan) {
            workoutPlan.day = day;
            workoutPlan.period = period || workoutPlan.period;
            workoutPlan.exercises = exercises.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                intensity: exercise.intensity,
                duration: exercise.duration,
                sets: exercise.sets,
                reps: exercise.reps,
                primaryFocus: exercise.primaryFocus,
            }));
            workoutPlan.status = status || 'Assigned';
            workoutPlan.createdBy = createdBy;

            await workoutPlan.save();

            client.workoutPlanStatus = 'Assigned';
            await client.save();

            const notificationData = {
                title: 'Workout Plan Updated',
                body: `Your workout plan for ${date} has been updated by ${admin.firstName} ${admin.lastName}.`,
                message: `Your workout plan for ${date} has been updated by ${admin.firstName} ${admin.lastName}.`,
                clientId: client._id,
                adminId: admin._id,
            };

            await Notification.createNotification(notificationData);

            if (client.fcmToken) {
                const pushNotificationData = {
                    title: 'Workout Plan Updated',
                    body: `Your workout plan for ${date} has been updated by ${admin.firstName} ${admin.lastName}.`,
                    data: { workoutPlanId: workoutPlan._id.toString() },
                    fcmToken: client.fcmToken,
                };

                await systemNotificationServices.newNotification(
                    pushNotificationData.body,
                    pushNotificationData.title,
                    pushNotificationData.fcmToken,
                    pushNotificationData.data,
                    null
                );
            }

            return sendResponse(
                res,
                responseStatusCodes.OK,
                'Workout Plan updated successfully',
                workoutPlan,
                req.logId
            );
        }

        // Create a new plan if none exists
        workoutPlan = await workoutPlanServices.create({
            clientId,
            createdBy,
            date,
            day,
            period,
            status: status || 'Assigned',
            exercises: exercises.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                intensity: exercise.intensity,
                duration: exercise.duration,
                sets: exercise.sets,
                reps: exercise.reps,
                primaryFocus: exercise.primaryFocus,
            })),
        });

        client.workoutPlanStatus = 'Assigned';
        await client.save();

        const notificationData = {
            title: 'New Workout Plan Assigned',
            body: `A new workout plan has been assigned to you by ${admin.firstName} ${admin.lastName}.`,
            message: `You have received a new workout plan from ${admin.firstName} ${admin.lastName}.`,
            clientId: client._id,
            adminId: admin._id,
        };

        await Notification.createNotification(notificationData);

        if (client.fcmToken) {
            const pushNotificationData = {
                title: 'New Workout Plan Assigned',
                body: `A new workout plan has been assigned to you by ${admin.firstName} ${admin.lastName}.`,
                data: { workoutPlanId: workoutPlan._id.toString() },
                fcmToken: client.fcmToken,
            };

            await systemNotificationServices.newNotification(
                pushNotificationData.body,
                pushNotificationData.title,
                pushNotificationData.fcmToken,
                pushNotificationData.data,
                null
            );
        }

        return sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Workout Plan created successfully',
            workoutPlan,
            req.logId
        );
    })
    ,
    // createWorkoutPlan: asyncHandler(async (req, res) => {
    //     const validationResult = workoutPlanValidator.create.validate(req.body);
    //     if (validationResult.error) {
    //         return await sendResponse(
    //             res,
    //             responseStatusCodes.BAD,
    //             validationResult.error.details[0].message,
    //             null,
    //             req.logId
    //         );
    //     }

    //     const clientId = req.body.clientId;
    //     const client = await clientServices.getById(clientId);

    //     if (!client) {
    //         return await sendResponse(
    //             res,
    //             responseStatusCodes.NOTFOUND,
    //             'Client not found',
    //             null,
    //             req.logId
    //         );
    //     }

    //     const adminId = req.body.createdBy;
    //     const admin = await adminUserModel.findById(adminId);

    //     if (!admin) {
    //         return await sendResponse(
    //             res,
    //             responseStatusCodes.NOTFOUND,
    //             'Admin not found',
    //             null,
    //             req.logId
    //         );
    //     }

    //     const workoutPlan = await workoutPlanServices.create(req.body);
    //     client.workoutPlanStatus = 'Assigned';
    //     await client.save();
    //     const notificationData = {
    //         title: 'New Workout Plan Assigned',
    //         body: `A new workout plan has been assigned to you by ${admin.firstName} ${admin.lastName}.`,
    //         message: `You have received a new workout plan from ${admin.firstName} ${admin.lastName}.`,
    //         clientId: client._id,
    //         adminId: admin._id,
    //     };


    //     await Notification.createNotification(notificationData);
    //     if (client.fcmToken) {
    //         const pushNotificationData = {
    //             title: 'New Workout Plan Assigned',
    //             body: `A new workout plan has been assigned to you by ${admin.firstName} ${admin.lastName}.`,
    //             data: { workoutPlanId: workoutPlan._id.toString() },
    //             fcmToken: client.fcmToken,
    //         };


    //         await systemNotificationServices.newNotification(
    //             pushNotificationData.body,
    //             pushNotificationData.title,
    //             pushNotificationData.fcmToken,
    //             pushNotificationData.data,
    //             null
    //         );
    //     }
    //     return await sendResponse(
    //         res,
    //         responseStatusCodes.CREATED,
    //         'Workout Plan created successfully',
    //         workoutPlan,
    //         req.logId
    //     );
    // }),
    generateWorkoutPlan: asyncHandler(async (req, res) => {
        const { clientId } = req.body;

        if (!clientId) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'clientId is required.'
            );
        }

        try {

            const nutritionData = await NutritionAndExerciseHabits.findOne({ clientId }).lean();
            const fitnessData = await FitnessQuestions.findOne({ clientId }).lean();
            const demographicsData = await Demographics.findOne({ clientId }).lean();

            if (!nutritionData || !fitnessData || !demographicsData) {
                return sendResponse(
                    res,
                    responseStatusCodes.BAD,
                    'Client data is incomplete or missing.'
                );
            }

            const goal = fitnessData.goals || 'General fitness';
            const physicalActivityLevel = fitnessData.currentPhysicalActivityLevel || 'Moderate';
            const injuries = nutritionData.injuriesThatCanBeWorsenedByExercise || 'None';
            const equipmentAvailable = nutritionData.equipmentForExercising || 'Bodyweight';

            const prompt = `
Generate a strict JSON workout plan for a client with:
- Goal: "${goal}",
- Physical Activity Level: "${physicalActivityLevel}",
- Injuries: "${injuries}",
- Equipment Available: "${equipmentAvailable}".

Follow this structure:
{
  "exercises": [
    {
      "name": "Exercise Name (required)",
      "primaryFocus": "Any string (required)",
      "intensity": "Low | Medium | High (required)",
      "duration": 30,
      "sets": 3,
      "reps": 12,
      "movementPattern": "Any string (required)",
      "equipment": "Any string or 'Bodyweight' if not applicable (required)",
      "steps": [
        {
          "stepNumber": 1,
          "instruction": "Step 1 instruction (required)"
        },
        {
          "stepNumber": 2,
          "instruction": "Step 2 instruction (required)"
        }
      ]
    }
  ]
}
  reps must be a number
`;



            const gptResponse = await getChatGPTResponse.getChatGPTResponse(prompt);
            const workoutPlanData = JSON.parse(gptResponse);

            if (!workoutPlanData.exercises || !Array.isArray(workoutPlanData.exercises)) {
                return sendResponse(
                    res,
                    responseStatusCodes.BAD,
                    'Invalid workout plan format from GPT.'
                );
            }

            return sendResponse(
                res,
                responseStatusCodes.OK,
                'Workout Plan generated successfully.',
                workoutPlanData
            );
        } catch (error) {
            console.error('Error generating workout plan:', error);
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'Failed to generate workout plan.'
            );
        }
    }),

    // saveGPTWorkoutPlan: asyncHandler(async (req, res) => {
    //     const validationResult = workoutPlanValidator.saveGpt.validate(req.body);
    //     if (validationResult.error) {
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.BAD,
    //             validationResult.error.details[0].message,
    //             null,
    //             req.logId
    //         );
    //     }

    //     const { clientId, createdBy, exercises, day, date, period } = req.body;

    //     const client = await clientServices.getById(clientId);
    //     if (!client) {
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.NOTFOUND,
    //             'Client not found',
    //             null,
    //             req.logId
    //         );
    //     }

    //     const admin = await adminUserModel.findById(createdBy);
    //     if (!admin) {
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.NOTFOUND,
    //             'Admin not found',
    //             null,
    //             req.logId
    //         );
    //     }


    //     const existingPlan = await WorkoutPlan.findOne({ clientId, date });
    //     if (existingPlan) {
    //         existingPlan.exercises = await Promise.all(
    //             exercises.map(async (exercise) => {
    //                 const newExercise = new exerciseModel(exercise);
    //                 const savedExercise = await newExercise.save();

    //                 return {
    //                     exerciseId: savedExercise._id,
    //                     primaryFocus: savedExercise.primaryFocus,
    //                     intensity: exercise.intensity,
    //                     duration: exercise.duration,
    //                     sets: exercise.sets,
    //                     reps: exercise.reps,
    //                 };
    //             })
    //         );

    //         existingPlan.day = day;
    //         existingPlan.period = period || existingPlan.period;
    //         existingPlan.createdBy = createdBy;
    //         existingPlan.status = 'Assigned';

    //         await existingPlan.save();

    //         client.workoutPlanStatus = 'Assigned';
    //         await client.save();

    //         const notificationData = {
    //             title: 'Workout Plan Updated',
    //             body: `Your workout plan for ${date} has been updated by ${admin.firstName} ${admin.lastName}.`,
    //             message: `Your workout plan for ${date} has been updated by ${admin.firstName} ${admin.lastName}.`,
    //             clientId: client._id,
    //             adminId: admin._id,
    //         };

    //         await Notification.createNotification(notificationData);

    //         if (client.fcmToken) {
    //             const pushNotificationData = {
    //                 title: 'Workout Plan Updated',
    //                 body: `Your workout plan for ${date} has been updated by ${admin.firstName} ${admin.lastName}.`,
    //                 data: { workoutPlanId: existingPlan._id.toString() },
    //                 fcmToken: client.fcmToken,
    //             };

    //             await systemNotificationServices.newNotification(
    //                 pushNotificationData.body,
    //                 pushNotificationData.title,
    //                 pushNotificationData.fcmToken,
    //                 pushNotificationData.data,
    //                 null
    //             );
    //         }

    //         return sendResponse(
    //             res,
    //             responseStatusCodes.OK,
    //             'Workout Plan updated successfully',
    //             existingPlan,
    //             req.logId
    //         );
    //     }


    //     const savedExercises = await Promise.all(
    //         exercises.map(async (exercise) => {
    //             const newExercise = new exerciseModel(exercise);
    //             const savedExercise = await newExercise.save();

    //             return {
    //                 exerciseId: savedExercise._id,
    //                 primaryFocus: savedExercise.primaryFocus,
    //                 intensity: exercise.intensity,
    //                 duration: exercise.duration,
    //                 sets: exercise.sets,
    //                 reps: exercise.reps,
    //             };
    //         })
    //     );

    //     const workoutPlan = new WorkoutPlan({
    //         clientId,
    //         createdBy,
    //         day,
    //         date,
    //         period,
    //         exercises: savedExercises,
    //         status: 'Assigned',
    //     });

    //     await workoutPlan.save();

    //     client.workoutPlanStatus = 'Assigned';
    //     await client.save();

    //     const notificationData = {
    //         title: 'New Workout Plan Assigned',
    //         body: `A new workout plan has been assigned to you by ${admin.firstName} ${admin.lastName}.`,
    //         message: `You have received a new workout plan from ${admin.firstName} ${admin.lastName}.`,
    //         clientId: client._id,
    //         adminId: admin._id,
    //     };

    //     await Notification.createNotification(notificationData);

    //     if (client.fcmToken) {
    //         const pushNotificationData = {
    //             title: 'New Workout Plan Assigned',
    //             body: `A new workout plan has been assigned to you by ${admin.firstName} ${admin.lastName}.`,
    //             data: { workoutPlanId: workoutPlan._id.toString() },
    //             fcmToken: client.fcmToken,
    //         };

    //         await systemNotificationServices.newNotification(
    //             pushNotificationData.body,
    //             pushNotificationData.title,
    //             pushNotificationData.fcmToken,
    //             pushNotificationData.data,
    //             null
    //         );
    //     }

    //     return sendResponse(
    //         res,
    //         responseStatusCodes.CREATED,
    //         'Workout Plan created successfully',
    //         workoutPlan,
    //         req.logId
    //     );
    // })
    // ,


    saveGPTWorkoutPlan: asyncHandler(async (req, res) => {
        const validationResult = workoutPlanValidator.saveGpt.validate(req.body);
        if (validationResult.error) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const { clientId, createdBy, exercises, day, date, period } = req.body;

        const client = await clientServices.getById(clientId);
        if (!client) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Client not found',
                null,
                req.logId
            );
        }

        const admin = await adminUserModel.findById(createdBy);
        if (!admin) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Admin not found',
                null,
                req.logId
            );
        }

        const existingPlan = await WorkoutPlan.findOne({ clientId, date });
        if (existingPlan) {
            existingPlan.exercises = await Promise.all(
                exercises.map(async (exercise) => {
                    // Check for existing exercise by name
                    let existingExercise = await exerciseModel.findOne({ name: exercise.name });

                    if (!existingExercise) {
                        // If no existing exercise, create a new one
                        const newExercise = new exerciseModel(exercise);
                        existingExercise = await newExercise.save();
                    }

                    return {
                        exerciseId: existingExercise._id,
                        primaryFocus: existingExercise.primaryFocus,
                        intensity: exercise.intensity,
                        duration: exercise.duration,
                        sets: exercise.sets,
                        reps: exercise.reps,
                    };
                })
            );

            existingPlan.day = day;
            existingPlan.period = period || existingPlan.period;
            existingPlan.createdBy = createdBy;
            existingPlan.status = 'Assigned';

            await existingPlan.save();

            client.workoutPlanStatus = 'Assigned';
            await client.save();

            const notificationData = {
                title: 'Workout Plan Updated',
                body: `Your workout plan for ${date} has been updated by ${admin.firstName} ${admin.lastName}.`,
                message: `Your workout plan for ${date} has been updated by ${admin.firstName} ${admin.lastName}.`,
                clientId: client._id,
                adminId: admin._id,
            };

            await Notification.createNotification(notificationData);

            if (client.fcmToken) {
                const pushNotificationData = {
                    title: 'Workout Plan Updated',
                    body: `Your workout plan for ${date} has been updated by ${admin.firstName} ${admin.lastName}.`,
                    data: { workoutPlanId: existingPlan._id.toString() },
                    fcmToken: client.fcmToken,
                };

                await systemNotificationServices.newNotification(
                    pushNotificationData.body,
                    pushNotificationData.title,
                    pushNotificationData.fcmToken,
                    pushNotificationData.data,
                    null
                );
            }

            return sendResponse(
                res,
                responseStatusCodes.OK,
                'Workout Plan updated successfully',
                existingPlan,
                req.logId
            );
        }

        const savedExercises = await Promise.all(
            exercises.map(async (exercise) => {
                // Check for existing exercise by name
                let existingExercise = await exerciseModel.findOne({ name: exercise.name });

                if (!existingExercise) {
                    // If no existing exercise, create a new one
                    const newExercise = new exerciseModel(exercise);
                    existingExercise = await newExercise.save();
                }

                return {
                    exerciseId: existingExercise._id,
                    primaryFocus: existingExercise.primaryFocus,
                    intensity: exercise.intensity,
                    duration: exercise.duration,
                    sets: exercise.sets,
                    reps: exercise.reps,
                };
            })
        );

        const workoutPlan = new WorkoutPlan({
            clientId,
            createdBy,
            day,
            date,
            period,
            exercises: savedExercises,
            status: 'Assigned',
        });

        await workoutPlan.save();

        client.workoutPlanStatus = 'Assigned';
        await client.save();

        const notificationData = {
            title: 'New Workout Plan Assigned',
            body: `A new workout plan has been assigned to you by ${admin.firstName} ${admin.lastName}.`,
            message: `You have received a new workout plan from ${admin.firstName} ${admin.lastName}.`,
            clientId: client._id,
            adminId: admin._id,
        };

        await Notification.createNotification(notificationData);

        if (client.fcmToken) {
            const pushNotificationData = {
                title: 'New Workout Plan Assigned',
                body: `A new workout plan has been assigned to you by ${admin.firstName} ${admin.lastName}.`,
                data: { workoutPlanId: workoutPlan._id.toString() },
                fcmToken: client.fcmToken,
            };

            await systemNotificationServices.newNotification(
                pushNotificationData.body,
                pushNotificationData.title,
                pushNotificationData.fcmToken,
                pushNotificationData.data,
                null
            );
        }

        return sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Workout Plan created successfully',
            workoutPlan,
            req.logId
        );
    })
    ,
    getAllWorkoutPlansByClient: asyncHandler(async (req, res) => {
        const { clientId, date } = req.body;
        // console.log("clientId", clientId)
        // console.log("date", date)
        const workoutPlans = await workoutPlanServices.getAllByClient(clientId, date);
        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Workout Plans retrieved successfully',
            workoutPlans,
            req.logId
        );
    }),

    updateWorkoutPlan: asyncHandler(async (req, res) => {
        const validationResult = workoutPlanValidator.update.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }
        const updatedWorkoutPlan = await workoutPlanServices.update(req.params.id, req.body);
        if (updatedWorkoutPlan) {
            return await sendResponse(
                res,
                responseStatusCodes.OK,
                'Workout Plan updated successfully',
                updatedWorkoutPlan,
                req.logId
            );
        } else {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Workout Plan not found',
                null,
                req.logId
            );
        }
    }),

    deleteWorkoutPlan: asyncHandler(async (req, res) => {
        const deleted = await workoutPlanServices.delete(req.params.id);
        if (!deleted) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Workout Plan not found',
                null,
                req.logId
            );
        }
        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Workout Plan deleted successfully.',
            null,
            req.logId
        );
    }),

    getWorkoutPlanById: asyncHandler(async (req, res) => {
        const workoutPlan = await workoutPlanServices.getById(req.params.id);
        if (!workoutPlan) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Workout Plan not found',
                null,
                req.logId
            );
        }
        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Workout Plan retrieved successfully',
            workoutPlan,
            req.logId
        );
    }),

    updateWorkoutPlanStatus: asyncHandler(async (req, res) => {
        try {
            const { clientId, date, status } = req.body;

            const updatedWorkoutPlan = await workoutPlanServices.updateWorkoutPlanStatus(clientId, date, status);

            if (updatedWorkoutPlan) {
                return sendResponse(
                    res,
                    responseStatusCodes.OK,
                    'Workout plan status updated successfully.',
                    updatedWorkoutPlan
                );
            } else {
                console.log('Workout plan not found for the given date and clientId.');
                return sendResponse(
                    res,
                    responseStatusCodes.NOTFOUND,
                    'Workout plan not found for the given date and clientId.'
                );
            }
        } catch (error) {
            console.error('Error in updateWorkoutPlanStatus controller:', error);
            return sendResponse(res, responseStatusCodes.SERVER, 'Internal server error.');
        }
    }),



};

module.exports = workoutPlanController;
