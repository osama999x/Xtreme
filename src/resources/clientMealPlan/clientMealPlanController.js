const asyncHandler = require('express-async-handler');
const clientMealPlanService = require('./clientMealPlanService');
const { validateClientMealPlan } = require('./clientMealPlanValidator');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const ClientMealPlan = require('./clientMealPlanModel')
const Client = require("../clients/clientModel")
const getChatGPTResponse = require('../../utils/gpt');
const NutritionAndExerciseHabits = require('../nutritionAndExercise/nutritionAndExerciseModel');
const FitnessQuestions = require('../fitnessQuestionares/fitnessQuestionaresModel');
const Demographics = require('../demographics/demographicModel');
const Meal = require('../meals/mealModel')
const Recipe = require('../recipe/recipeModel');
const mongoose = require('mongoose');
const AdminUser = require('../adminUser/adminUserModel')
const systemNotificationServices = require('../systemNotifications/systemNotification');
const notificationService = require('../notifications/notificationService')


const clientMealPlanController = {
    // generateMealPlan: asyncHandler(async (req, res) => {
    //     const { clientId } = req.body;

    //     if (!clientId) {
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.BAD,
    //             'clientId is required.'
    //         );
    //     }

    //     try {
    //         const nutritionData = await NutritionAndExerciseHabits.findOne({ clientId }).lean();
    //         const fitnessData = await FitnessQuestions.findOne({ clientId }).lean();
    //         const demographicsData = await Demographics.findOne({ clientId }).lean();

    //         if (!nutritionData || !fitnessData || !demographicsData) {
    //             return sendResponse(
    //                 res,
    //                 responseStatusCodes.BAD,
    //                 'Client data is incomplete or missing.'
    //             );
    //         }

    //         const goal = fitnessData.goals || nutritionData.motivationToGetInShape || 'general health';
    //         const dietaryRestrictions = nutritionData.dietaryRestrictions || 'none';
    //         const foodAllergies = nutritionData.foodAllergies || 'none';
    //         const hasMedicalConditions = fitnessData.medicalOrHealthConditions || 'none';

    //         let mealType = 'Balanced Plan';
    //         let carbRange = '40-50% of total calories';
    //         let calorieRange = '2000-2500 calories/day';

    //         if (hasMedicalConditions.includes('diabetes')) {
    //             mealType = 'Diabetes-Friendly Plan';
    //             carbRange = '40-45% of total calories';
    //             calorieRange = '1800-2200 calories/day';
    //         } else if (goal.toLowerCase().includes('weight loss')) {
    //             mealType = 'Weight Loss Plan';
    //             carbRange = '20-30% of total calories';
    //             calorieRange = '1200-1500 calories/day';
    //         } else if (goal.toLowerCase().includes('muscle gain') || goal.toLowerCase().includes('bulk')) {
    //             mealType = 'Muscle Gain Plan';
    //             carbRange = '50-60% of total calories';
    //             calorieRange = '2500-3000 calories/day';
    //         }

    //         const prompt = `
    //     Generate a JSON meal plan for a client with:
    //     Goal: "${goal}", Meal Type: "${mealType}", Gender: "${demographicsData.gender || 'not specified'}",
    //     Age: "${demographicsData.age || 'not specified'}", Height: "${demographicsData.height || 'not specified'}",
    //     Weight: "${demographicsData.weight || 'not specified'}", Activity level: "${fitnessData.currentPhysicalActivityLevel || 'not specified'}",
    //     Allergies: "${foodAllergies}", Dietary restrictions: "${dietaryRestrictions}", Medical conditions: "${hasMedicalConditions}",
    //     Foods to avoid: "${nutritionData.foodsToAvoid || 'none'}", Carb Range: "${carbRange}", Calorie Range: "${calorieRange}".
    //     5 meals/day, JSON format:
    //     {"meals":[{"mealName":"","calories":0,"protein":0,"fats":0,"carbs":0,"mealType":"","recipes":[{"recipeName":"","ingredients":[{"ingredientName":"","quantity":""}],"steps":[{"stepNumber":1,"instruction":""}]}]}]}
    //     `;

    //         const gptResponse = await getChatGPTResponse.getChatGPTResponse(prompt);
    //         const mealPlan = JSON.parse(gptResponse);

    //         if (!mealPlan.meals || !Array.isArray(mealPlan.meals)) {
    //             return sendResponse(
    //                 res,
    //                 responseStatusCodes.BAD,
    //                 'Invalid meal plan format from GPT.'
    //             );
    //         }

    //         mealPlan.meals.forEach(meal => {
    //             if (!meal.mealType) {
    //                 meal.mealType = mealType;
    //             }
    //         });

    //         return sendResponse(
    //             res,
    //             responseStatusCodes.OK,
    //             'Meal plan generated successfully.',
    //             { clientId, goal, mealType, carbRange, calorieRange, mealPlan }
    //         );
    //     } catch (error) {
    //         console.error('Error generating meal plan:', error);
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.BAD,
    //             'Failed to generate meal plan.'
    //         );
    //     }
    // })

    generateMealPlan: asyncHandler(async (req, res) => {
        const { clientId } = req.body;

        if (!clientId) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'clientId is required.'
            );
        }

        try {
            // Fetch the last assigned meal plan for the client
            const lastMealPlan = await ClientMealPlan.findOne({ clientId })
                .sort({ date: -1 })
                .lean();

            // Fetch client's data
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

            const goal = fitnessData.goals || nutritionData.motivationToGetInShape || 'general health';
            const dietaryRestrictions = nutritionData.dietaryRestrictions || 'none';
            const foodAllergies = nutritionData.foodAllergies || 'none';
            const hasMedicalConditions = fitnessData.medicalOrHealthConditions || 'none';


            let mealType = 'Balanced Plan';
            let carbRange = '40-50% of total calories';
            let calorieRange = '2000-2500 calories/day';

            if (lastMealPlan) {
                const lastMealType = lastMealPlan.mealType;
                switch (lastMealType) {
                    case 'High-Carb Day':
                        mealType = 'Low-Carb Day';
                        carbRange = '20% Carbs, 40% Protein, 40% Fat';
                        calorieRange = `${parseInt(lastMealPlan.calories) + 200} calories/day`;
                        break;
                    case 'Low-Carb Day':
                        mealType = 'Balanced Plan';
                        carbRange = '40-50% of total calories';
                        calorieRange = `${parseInt(lastMealPlan.calories) + 200} calories/day`;
                        break;
                    case 'Balanced Plan':
                        mealType = 'For Diabetics or upon request';
                        carbRange = '35% Carbs, 35% Protein, 30% Fat';
                        calorieRange = `${parseInt(lastMealPlan.calories) + 200} calories/day`;
                        break;
                    case 'For Diabetics or upon request':
                        mealType = 'Muscle Gain Plan';
                        carbRange = '50% Carbs, 30% Protein, 20% Fat';
                        calorieRange = `${parseInt(lastMealPlan.calories) + 200} calories/day`;
                        break;
                    case 'Muscle Gain Plan':
                        mealType = 'Maintenance Plan';
                        carbRange = '50% Carbs, 30% Protein, 20% Fat';
                        calorieRange = `${parseInt(lastMealPlan.calories) + 200} calories/day`;
                        break;
                    case 'Maintenance Plan':
                        mealType = 'High-Carb Day';
                        carbRange = '60-70% Carbs, 15-25% Protein, 15-25% Fat';
                        calorieRange = `${parseInt(lastMealPlan.calories) + 200} calories/day`;
                        break;
                    default:
                        mealType = 'Balanced Plan';
                        carbRange = '40-50% of total calories';
                        calorieRange = '2000-2500 calories/day';
                }
            } else {
                mealType = 'Balanced Plan';
                carbRange = '40-50% of total calories';
                calorieRange = '2000-2500 calories/day';
            }

            const prompt = `
            Generate a JSON meal plan for a client with:
            Goal: "${goal}", Meal Type: "${mealType}", Gender: "${demographicsData.gender || 'not specified'}",
            Age: "${demographicsData.age || 'not specified'}", Height: "${demographicsData.height || 'not specified'}",
            Weight: "${demographicsData.weight || 'not specified'}", Activity level: "${fitnessData.currentPhysicalActivityLevel || 'not specified'}",
            Allergies: "${foodAllergies}", Dietary restrictions: "${dietaryRestrictions}", Medical conditions: "${hasMedicalConditions}",
            Foods to avoid: "${nutritionData.foodsToAvoid || 'none'}", Carb Range: "${carbRange}", Calorie Range: "${calorieRange}".
            Generate aesthetic, creative, and engaging meal names for each meal.
            5 meals/day, JSON format:
            {"meals":[{"mealName":"e.g. 'Golden Sunrise Smoothie'", "calories":0,"protein":0,"fats":0,"carbs":0,"mealType":"e.g. 'Low-Carb Day'","recipes":[{"recipeName":"e.g. 'Tropical Boost'", "ingredients":[{"ingredientName":"e.g. 'Mango'", "quantity":"1 cup"}],"steps":[{"stepNumber":1,"instruction":"e.g. 'Blend mango with coconut water and a handful of spinach.'"}]}]}]}
        `;

            const gptResponse = await getChatGPTResponse.getChatGPTResponse(prompt);
            const mealPlan = JSON.parse(gptResponse);

            if (!mealPlan.meals || !Array.isArray(mealPlan.meals)) {
                return sendResponse(
                    res,
                    responseStatusCodes.BAD,
                    'Invalid meal plan format from GPT.'
                );
            }

            mealPlan.meals.forEach(meal => {
                if (!meal.mealType) {
                    meal.mealType = mealType;
                }
                if (!meal.mealName) {
                    meal.mealName = `Aesthetic ${mealType} Meal`;
                }
            });

            // const newMealPlan = new ClientMealPlan({
            //     clientId,
            //     day: 'Day 1', // Example: should be dynamic based on the date or schedule
            //     date: new Date(),
            //     status: 'Active', // Or 'Pending', depending on your workflow
            //     meals: mealPlan.meals.map(meal => ({ mealId: meal._id })), // Assuming meal has an _id
            //     createdBy: req.user._id, // Assuming user info is available in req.user
            // });

            // await newMealPlan.save();

            return sendResponse(
                res,
                responseStatusCodes.OK,
                'Meal plan generated and saved successfully.',
                { clientId, goal, mealType, carbRange, calorieRange, mealPlan }
            );

        } catch (error) {
            console.error('Error generating meal plan:', error);
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'Failed to generate meal plan.'
            );
        }
    })
    ,
    // saveGPTMealPlan: asyncHandler(async (req, res) => {
    //     const { clientId, day, date, status, createdBy, mealPlan } = req.body;

    //     if (!clientId || !day || !date || !mealPlan) {
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.BAD,
    //             'clientId, day, date, and mealPlan are required.'
    //         );
    //     }

    //     try {
    //         const mealReferences = [];

    //         for (const meal of mealPlan.meals) {
    //             const newMeal = new Meal({
    //                 mealName: meal.mealName,
    //                 mealType: meal.mealType,
    //                 totalCalories: meal.calories,
    //                 totalProtein: meal.protein,
    //                 totalFats: meal.fats,
    //                 totalCarbs: meal.carbs,
    //                 totalMeals: 1,
    //             });

    //             const savedMeal = await newMeal.save();

    //             const recipes = meal.recipes.map((recipe) => ({
    //                 recipeName: recipe.recipeName,
    //                 calories: meal.calories,
    //                 protein: meal.protein,
    //                 fats: meal.fats,
    //                 carbs: meal.carbs,
    //                 ingredients: recipe.ingredients.map(ingredient => ({
    //                     ingredientName: ingredient.ingredientName,
    //                     quantity: ingredient.quantity,
    //                 })),
    //                 steps: recipe.steps.map(step => ({
    //                     stepNumber: step.stepNumber,
    //                     instruction: step.instruction,
    //                 })),
    //                 mealId: savedMeal._id,
    //             }));

    //             await Recipe.insertMany(recipes);

    //             mealReferences.push({ mealId: savedMeal._id });
    //         }


    //         const clientMealPlan = new ClientMealPlan({
    //             clientId: new mongoose.Types.ObjectId(clientId),
    //             day,
    //             date: new Date(date),
    //             status: status || 'Assigned',
    //             meals: mealReferences,
    //             createdBy: new mongoose.Types.ObjectId(createdBy),
    //         });

    //         const savedMealPlan = await clientMealPlan.save();

    //         const admin = await AdminUser.findById(createdBy);
    //         if (!admin) {
    //             throw new Error('Admin not found');
    //         }

    //         const adminName = `${admin.firstName} ${admin.lastName}`;

    //         const notificationData = {
    //             title: 'Meal Plan Assigned',
    //             body: `A new meal plan has been assigned to you by ${adminName}.`,
    //             message: `You have received a new meal plan from ${adminName}. Check your meal plan section for details.`,
    //             clientId: clientId,
    //             adminId: admin._id,
    //         };

    //         await notificationService.createNotification(notificationData);
    //         const client = await Client.findById(clientId);
    //         if (client && client.fcmToken) {
    //             const pushNotificationData = {
    //                 title: 'Meal Plan Assigned',
    //                 body: `A new meal plan has been assigned to you by ${adminName}.`,
    //                 data: { mealPlanId: savedMealPlan._id.toString() },
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
    //             'Meal plan saved successfully.',
    //             { clientMealPlan: savedMealPlan }
    //         );
    //     } catch (error) {
    //         console.error('Error saving meal plan:', error);
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.SERVER,
    //             'Failed to save meal plan.'
    //         );
    //     }
    // }),
    ///wwwwwwww/
    // saveGPTMealPlan: asyncHandler(async (req, res) => {
    //     const { clientId, day, date, status, createdBy, mealPlan } = req.body;

    //     if (!clientId || !day || !date || !mealPlan) {
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.BAD,
    //             'clientId, day, date, and mealPlan are required.'
    //         );
    //     }

    //     // Start a session for the transaction
    //     const session = await mongoose.startSession();
    //     session.startTransaction();

    //     try {
    //         // Check if a meal plan already exists for the given clientId and date
    //         let existingMealPlan = await ClientMealPlan.findOne({ clientId, date: new Date(date) }).lean();

    //         // Function to handle recipes creation or reuse
    //         const handleRecipes = async (meal, savedMealId) => {
    //             const recipes = [];
    //             for (const recipe of meal.recipes) {
    //                 // Check if a recipe with the same name exists
    //                 let existingRecipe = await Recipe.findOne({ recipeName: new RegExp(`^${recipe.recipeName}$`, 'i') }).session(session);

    //                 if (!existingRecipe) {
    //                     // Create a new recipe if not found
    //                     existingRecipe = new Recipe({
    //                         recipeName: recipe.recipeName,
    //                         calories: meal.calories,
    //                         protein: meal.protein,
    //                         fats: meal.fats,
    //                         carbs: meal.carbs,
    //                         ingredients: recipe.ingredients.map(ingredient => ({
    //                             ingredientName: ingredient.ingredientName,
    //                             quantity: ingredient.quantity,
    //                         })),
    //                         steps: recipe.steps.map(step => ({
    //                             stepNumber: step.stepNumber,
    //                             instruction: step.instruction,
    //                         })),
    //                         mealId: savedMealId,
    //                     });

    //                     // Save the new recipe
    //                     await existingRecipe.save({ session });
    //                 }

    //                 // Add the existing or newly created recipe to the list
    //                 recipes.push(existingRecipe);
    //             }
    //             return recipes;
    //         };

    //         const mealReferences = [];

    //         for (const meal of mealPlan.meals) {
    //             // Check if a meal with the same name already exists
    //             let existingMeal = await Meal.findOne({ mealName: new RegExp(`^${meal.mealName}$`, 'i') }).session(session);

    //             if (existingMeal) {
    //                 // Update the existing meal with new data
    //                 existingMeal.mealType = meal.mealType;
    //                 existingMeal.totalCalories = meal.calories;
    //                 existingMeal.totalProtein = meal.protein;
    //                 existingMeal.totalFats = meal.fats;
    //                 existingMeal.totalCarbs = meal.carbs;

    //                 // Save the updated meal
    //                 await existingMeal.save({ session });
    //             } else {
    //                 // Create a new meal if not found
    //                 existingMeal = new Meal({
    //                     mealName: meal.mealName,
    //                     mealType: meal.mealType,
    //                     totalCalories: meal.calories,
    //                     totalProtein: meal.protein,
    //                     totalFats: meal.fats,
    //                     totalCarbs: meal.carbs,
    //                     totalMeals: 1,
    //                 });

    //                 await existingMeal.save({ session });
    //             }

    //             // Handle recipes for this meal
    //             const recipes = await handleRecipes(meal, existingMeal._id);

    //             // Add the meal reference
    //             mealReferences.push({ mealId: existingMeal._id, recipes });
    //         }

    //         if (existingMealPlan) {
    //             // Update existing meal plan
    //             await ClientMealPlan.updateOne(
    //                 { _id: existingMealPlan._id },
    //                 {
    //                     $set: {
    //                         status: status || 'Assigned',
    //                         day,
    //                         meals: mealReferences,
    //                     },
    //                 },
    //                 { session }
    //             );

    //             await session.commitTransaction();
    //             return sendResponse(
    //                 res,
    //                 responseStatusCodes.OK,
    //                 'Meal plan updated successfully.',
    //                 { clientMealPlan: existingMealPlan }
    //             );
    //         } else {
    //             // Create new meal plan
    //             const clientMealPlan = new ClientMealPlan({
    //                 clientId: new mongoose.Types.ObjectId(clientId),
    //                 day,
    //                 date: new Date(date),
    //                 status: status || 'Assigned',
    //                 meals: mealReferences,
    //                 createdBy: new mongoose.Types.ObjectId(createdBy),
    //             });

    //             const savedMealPlan = await clientMealPlan.save({ session });

    //             const admin = await AdminUser.findById(createdBy).session(session);
    //             if (!admin) {
    //                 throw new Error('Admin not found');
    //             }

    //             const adminName = `${admin.firstName} ${admin.lastName}`;

    //             const notificationData = {
    //                 title: 'Meal Plan Assigned',
    //                 body: `A new meal plan has been assigned to you by ${adminName}.`,
    //                 message: `You have received a new meal plan from ${adminName}. Check your meal plan section for details.`,
    //                 clientId: clientId,
    //                 adminId: admin._id,
    //             };

    //             await notificationService.createNotification(notificationData, session);

    //             const client = await Client.findById(clientId).session(session);
    //             if (client && client.fcmToken) {

    //                 const pushNotificationData = {
    //                     title: 'Meal Plan Assigned',
    //                     body: `A new meal plan has been assigned to you by ${adminName}.`,
    //                     data: { mealPlanId: savedMealPlan._id.toString() },
    //                     fcmToken: client.fcmToken,
    //                 };

    //                 await systemNotificationServices.newNotification(
    //                     pushNotificationData.body,
    //                     pushNotificationData.title,
    //                     pushNotificationData.fcmToken,
    //                     pushNotificationData.data,
    //                     session
    //                 );
    //             }

    //             await session.commitTransaction();
    //             return sendResponse(
    //                 res,
    //                 responseStatusCodes.OK,
    //                 'Meal plan saved successfully.',
    //                 { clientMealPlan: savedMealPlan }
    //             );
    //         }
    //     } catch (error) {
    //         await session.abortTransaction();
    //         console.error('Error saving meal plan:', error);
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.SERVER,
    //             'Failed to save meal plan.'
    //         );
    //     } finally {
    //         session.endSession();
    //     }
    // })
    saveGPTMealPlan: asyncHandler(async (req, res) => {
        const { clientId, day, date, status, createdBy, mealPlan } = req.body;

        if (!clientId || !day || !date || !mealPlan) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'clientId, day, date, and mealPlan are required.'
            );
        }

        // Start a session for the transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check if a meal plan already exists for the given clientId and date
            let existingMealPlan = await ClientMealPlan.findOne({ clientId, date: new Date(date) }).lean();

            // Function to handle recipes creation or reuse
            const handleRecipes = async (meal, savedMealId) => {
                const recipes = [];
                for (const recipe of meal.recipes) {
                    // Check if a recipe with the same name exists
                    let existingRecipe = await Recipe.findOne({ recipeName: new RegExp(`^${recipe.recipeName}$`, 'i') }).session(session);

                    if (!existingRecipe) {
                        // Create a new recipe if not found
                        existingRecipe = new Recipe({
                            recipeName: recipe.recipeName,
                            calories: meal.calories,
                            protein: meal.protein,
                            fats: meal.fats,
                            carbs: meal.carbs,
                            ingredients: recipe.ingredients.map(ingredient => ({
                                ingredientName: ingredient.ingredientName,
                                quantity: ingredient.quantity,
                            })),
                            steps: recipe.steps.map(step => ({
                                stepNumber: step.stepNumber,
                                instruction: step.instruction,
                            })),
                            mealId: savedMealId,
                        });

                        // Save the new recipe
                        await existingRecipe.save({ session });
                    }

                    // Add the existing or newly created recipe to the list
                    recipes.push(existingRecipe);
                }
                return recipes;
            };

            const mealReferences = [];

            for (const meal of mealPlan.meals) {
                // Check if a meal with the same name already exists
                let existingMeal = await Meal.findOne({ mealName: new RegExp(`^${meal.mealName}$`, 'i') }).session(session);

                if (existingMeal) {
                    // Update the existing meal with new data
                    existingMeal.mealType = meal.mealType;
                    existingMeal.totalCalories = meal.calories;
                    existingMeal.totalProtein = meal.protein;
                    existingMeal.totalFats = meal.fats;
                    existingMeal.totalCarbs = meal.carbs;

                    // Save the updated meal
                    await existingMeal.save({ session });
                } else {
                    // Create a new meal if not found
                    existingMeal = new Meal({
                        mealName: meal.mealName,
                        mealType: meal.mealType,
                        totalCalories: meal.calories,
                        totalProtein: meal.protein,
                        totalFats: meal.fats,
                        totalCarbs: meal.carbs,
                        totalMeals: 1,
                    });

                    await existingMeal.save({ session });
                }

                // Handle recipes for this meal
                const recipes = await handleRecipes(meal, existingMeal._id);

                // Add the meal reference
                mealReferences.push({ mealId: existingMeal._id, recipes });
            }

            if (existingMealPlan) {
                // Update existing meal plan
                await ClientMealPlan.updateOne(
                    { _id: existingMealPlan._id },
                    {
                        $set: {
                            status: status || 'Assigned',
                            day,
                            meals: mealReferences,
                        },
                    },
                    { session }
                );

                // "abcv" logic: actions to take when meal plan is assigned (for example, logging)
                console.log(`Meal plan for client ${clientId} updated with status: ${status || 'Assigned'}`);

                // Assuming the "abcv" part here is sending a notification or logging an action
                // Trigger a notification or log the action (example)
                const client = await Client.findById(clientId).session(session);
                if (client && client.fcmToken) {
                    const admin = await AdminUser.findById(createdBy).session(session);
                    const adminName = `${admin.firstName} ${admin.lastName}`;

                    const pushNotificationData = {
                        title: 'Meal Plan Assigned',
                        body: `A new meal plan has been assigned to you by ${adminName}.`,
                        fcmToken: client.fcmToken,
                    };

                    await systemNotificationServices.newNotification(
                        pushNotificationData.body,
                        pushNotificationData.title,
                        pushNotificationData.fcmToken,
                        { mealPlanId: existingMealPlan._id.toString() },
                        session
                    );
                }

                await session.commitTransaction();
                return sendResponse(
                    res,
                    responseStatusCodes.OK,
                    'Meal plan updated successfully.',
                    { clientMealPlan: existingMealPlan }
                );
            } else {
                // Create new meal plan if none exists
                const clientMealPlan = new ClientMealPlan({
                    clientId: new mongoose.Types.ObjectId(clientId),
                    day,
                    date: new Date(date),
                    status: status || 'Assigned',
                    meals: mealReferences,
                    createdBy: new mongoose.Types.ObjectId(createdBy),
                });

                const savedMealPlan = await clientMealPlan.save({ session });

                const admin = await AdminUser.findById(createdBy).session(session);
                if (!admin) {
                    throw new Error('Admin not found');
                }

                const adminName = `${admin.firstName} ${admin.lastName}`;

                const notificationData = {
                    title: 'Meal Plan Assigned',
                    body: `A new meal plan has been assigned to you by ${adminName}.`,
                    message: `You have received a new meal plan from ${adminName}. Check your meal plan section for details.`,
                    clientId: clientId,
                    adminId: admin._id,
                };

                await notificationService.createNotification(notificationData, session);

                const client = await Client.findById(clientId).session(session);
                if (client && client.fcmToken) {
                    const pushNotificationData = {
                        title: 'Meal Plan Assigned',
                        body: `A new meal plan has been assigned to you by ${adminName}.`,
                        data: { mealPlanId: savedMealPlan._id.toString() },
                        fcmToken: client.fcmToken,
                    };

                    await systemNotificationServices.newNotification(
                        pushNotificationData.body,
                        pushNotificationData.title,
                        pushNotificationData.fcmToken,
                        pushNotificationData.data,
                        session
                    );
                }

                await session.commitTransaction();
                return sendResponse(
                    res,
                    responseStatusCodes.OK,
                    'Meal plan saved successfully.',
                    { clientMealPlan: savedMealPlan }
                );
            }
        } catch (error) {
            await session.abortTransaction();
            console.error('Error saving meal plan:', error);
            return sendResponse(
                res,
                responseStatusCodes.SERVER,
                'Failed to save meal plan.'
            );
        } finally {
            session.endSession();
        }
    })

    ,
    createMealPlan: asyncHandler(async (req, res) => {

        const { error } = validateClientMealPlan(req.body);
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }



        try {

            const mealPlan = await clientMealPlanService.createMealPlan(req.body);

            return sendResponse(res, responseStatusCodes.CREATED, 'Meal plan created and assigned successfully', mealPlan);
        } catch (err) {
            return sendResponse(res, responseStatusCodes.BAD, err.message);
        }
    }),

    getMealPlans: asyncHandler(async (req, res) => {
        const mealPlans = await clientMealPlanService.getMealPlans(req.query.clientId);
        return sendResponse(res, responseStatusCodes.OK, 'Meal plans retrieved successfully', mealPlans);
    }),

    getMealPlanById: asyncHandler(async (req, res) => {
        const mealPlan = await clientMealPlanService.getMealPlanById(req.params.id);
        if (!mealPlan) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal plan not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Meal plan retrieved successfully', mealPlan);
    }),

    getMealPlanByClientId: asyncHandler(async (req, res) => {
        const { clientId, date } = req.body;
        const mealPlan = await clientMealPlanService.getClientMealPlanWithMealsAndRecipes(clientId, date);
        if (!mealPlan) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal plan not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Meal plan retrieved successfully', mealPlan);
    }),

    updateMealPlan: asyncHandler(async (req, res) => {
        const { error } = validateClientMealPlan(req.body);
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }

        const updatedMealPlan = await clientMealPlanService.updateMealPlan(req.params.id, req.body);
        if (!updatedMealPlan) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal plan not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Meal plan updated successfully', updatedMealPlan);
    }),

    deleteMealPlan: asyncHandler(async (req, res) => {
        const result = await clientMealPlanService.deleteMealPlan(req.params.id);
        if (!result) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal plan not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Meal plan deleted successfully');
    }),
    // updateMealPlanStatus: asyncHandler(async (req, res) => {
    //     const { clientId, date, status } = req.body;

    //     if (!clientId || !date || !status) {
    //         return sendResponse(res, responseStatusCodes.BAD, 'clientId, date, and status are required.');
    //     }

    //     try {
    //         const mealPlan = await ClientMealPlan.findOne({
    //             clientId,
    //             date: new Date(date),
    //         });

    //         if (mealPlan) {
    //             mealPlan.status = status;
    //             await mealPlan.save();

    //             const client = await Client.findById(clientId);
    //             if (client) {
    //                 const mealPlansInRange = await ClientMealPlan.find({
    //                     clientId,
    //                 });

    //                 const allCompleted = mealPlansInRange.every(plan => plan.status === 'Completed');

    //                 if (allCompleted) {
    //                     client.mealPlanStatus = 'Not Requested';
    //                     client.mealPlanStatusStartDate = null;
    //                     client.mealPlanStatusEndDate = null;
    //                 } else {
    //                     client.mealPlanStatus = 'Assigned';
    //                 }

    //                 await client.save();
    //             }

    //             return sendResponse(res, responseStatusCodes.OK, 'Meal plan status updated successfully.', mealPlan);
    //         }


    //         console.log('Meal plan not found for the given date and clientId.');
    //     } catch (error) {
    //         console.error('Error updating meal plan status:', error);
    //         return sendResponse(res, responseStatusCodes.ERROR, 'Internal server error.');
    //     }
    // }),

    updateMealPlanStatus: asyncHandler(async (req, res) => {
        try {
            const { clientId, date, status } = req.body;

            const updatedMealPlan = await clientMealPlanService.updateMealPlanStatus(clientId, date, status);

            if (updatedMealPlan) {
                return sendResponse(
                    res,
                    responseStatusCodes.OK,
                    'Meal plan status updated successfully.',
                    updatedMealPlan
                );
            } else {
                console.log('Meal plan not found for the given date and clientId.');
                return sendResponse(
                    res,
                    responseStatusCodes.NOTFOUND,
                    'Meal plan not found for the given date and clientId.'
                );
            }
        } catch (error) {
            console.error('Error in updateMealPlanStatus controller:', error);
            return sendResponse(res, responseStatusCodes.SERVER, 'Internal server error.');
        }
    })

};

module.exports = clientMealPlanController;
