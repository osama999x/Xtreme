const ClientMealPlan = require('./clientMealPlanModel');
const mongoose = require('mongoose');
const Client = require('../clients/clientModel')
const AdminUser = require('../adminUser/adminUserModel')
const systemNotificationServices = require('../systemNotifications/systemNotification');
const notificationService = require('../notifications/notificationService')
class ClientMealPlanService {
    // async createMealPlan(data) {

    //     const mealPlan = new ClientMealPlan(data);
    //     const savedMealPlan = await mealPlan.save();

    //     await Client.findByIdAndUpdate(data.clientId, {
    //         mealPlanStatus: 'Assigned'
    //     });

    //     const admin = await AdminUser.findById(data.createdBy);
    //     if (!admin) {
    //         throw new Error('Admin not found');
    //     }

    //     const adminName = `${admin.firstName} ${admin.lastName}`;

    //     const notificationData = {
    //         title: 'Meal Plan Assigned',
    //         body: `A new meal plan has been assigned to you by ${adminName}.`,
    //         message: `You have received a new meal plan from ${adminName}. Check your meal plan section for details.`,
    //         clientId: data.clientId,
    //         adminId: admin._id,
    //     };

    //     await notificationService.createNotification(notificationData);

    //     const client = await Client.findById(data.clientId);
    //     if (client && client.fcmToken) {
    //         const pushNotificationData = {
    //             title: 'Meal Plan Assigned',
    //             body: `A new meal plan has been assigned to you by ${adminName}.`,
    //             data: { mealPlanId: savedMealPlan._id.toString() },
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

    //     return savedMealPlan;
    // }

    async createMealPlan(data) {
        let mealPlan = await ClientMealPlan.findOne({ clientId: data.clientId, date: data.date });

        if (mealPlan) {
            mealPlan.day = data.day;
            mealPlan.status = data.status || 'Assigned';
            mealPlan.meals = data.meals;
            mealPlan.createdBy = data.createdBy;

            const updatedMealPlan = await mealPlan.save();

            await Client.findByIdAndUpdate(data.clientId, {
                mealPlanStatus: 'Assigned',
            });

            const admin = await AdminUser.findById(data.createdBy);
            if (!admin) {
                throw new Error('Admin not found');
            }

            const adminName = `${admin.firstName} ${admin.lastName}`;

            const notificationData = {
                title: 'Meal Plan Updated',
                body: `Your meal plan has been updated by ${adminName}.`,
                message: `Your meal plan has been updated by ${adminName}. Check your meal plan section for details.`,
                clientId: data.clientId,
                adminId: admin._id,
            };

            await notificationService.createNotification(notificationData);

            const client = await Client.findById(data.clientId);
            if (client && client.fcmToken) {
                const pushNotificationData = {
                    title: 'Meal Plan Updated',
                    body: `Your meal plan has been updated by ${adminName}.`,
                    data: { mealPlanId: updatedMealPlan._id.toString() },
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

            return updatedMealPlan;
        }

        const newMealPlan = new ClientMealPlan(data);
        const savedMealPlan = await newMealPlan.save();

        await Client.findByIdAndUpdate(data.clientId, {
            mealPlanStatus: 'Assigned',
        });

        const admin = await AdminUser.findById(data.createdBy);
        if (!admin) {
            throw new Error('Admin not found');
        }

        const adminName = `${admin.firstName} ${admin.lastName}`;

        const notificationData = {
            title: 'Meal Plan Assigned',
            body: `A new meal plan has been assigned to you by ${adminName}.`,
            message: `You have received a new meal plan from ${adminName}. Check your meal plan section for details.`,
            clientId: data.clientId,
            adminId: admin._id,
        };

        await notificationService.createNotification(notificationData);

        const client = await Client.findById(data.clientId);
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
                null
            );
        }

        return savedMealPlan;
    }

    async checkMealPlanOverlap(clientId, newStartDate, newEndDate) {
        const client = await Client.findById(clientId);
        if (!client) {
            throw new Error('Client not found');
        }

        if (client.mealPlanStatus === 'Requested') {
            const { mealPlanStatusStartDate, mealPlanStatusEndDate } = client;

            // Check for overlapping dates
            if (
                newStartDate <= mealPlanStatusEndDate &&
                newEndDate >= mealPlanStatusStartDate
            ) {
                throw new Error(`A meal plan has already been requested between ${mealPlanStatusStartDate.toDateString()} and ${mealPlanStatusEndDate.toDateString()}.`);
            }
        }
    }


    async getMealPlans(clientId) {
        return await ClientMealPlan.find({ clientId }).populate('meals.id').populate('clientId');
    }

    async getMealPlanById(id) {
        return await ClientMealPlan.findById(id).populate('meals.id').populate('clientId');
    }

    async updateMealPlan(id, data) {
        return await ClientMealPlan.findByIdAndUpdate(id, data, { new: true });
    }
    async getClientMealPlanWithMealsAndRecipes(clientId, date) {
        try {
            let matchStage = {};

            // Check for both clientId and date
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
                matchStage = { clientId: mongoose.Types.ObjectId(clientId) };
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

            const mealPlans = await ClientMealPlan.aggregate([
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'meals', // Collection name for Meal
                        localField: 'meals.mealId',
                        foreignField: '_id',
                        as: 'mealDetails'
                    }
                },
                {
                    $unwind: '$mealDetails'
                },
                {
                    $lookup: {
                        from: 'recipes', // Collection name for Recipe
                        localField: 'mealDetails._id',
                        foreignField: 'mealId',
                        as: 'recipeDetails'
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        clientId: { $first: '$clientId' },
                        day: { $first: '$day' },
                        date: { $first: '$date' },
                        status: { $first: '$status' },
                        meals: {
                            $push: {
                                id: '$mealDetails._id',
                                mealName: '$mealDetails.mealName',
                                mealType: '$mealDetails.mealType',
                                totalCalories: '$mealDetails.totalCalories',
                                totalProtein: '$mealDetails.totalProtein',
                                totalFats: '$mealDetails.totalFats',
                                totalCarbs: '$mealDetails.totalCarbs',
                                totalMeals: '$mealDetails.totalMeals',
                                recipes: '$recipeDetails'
                            }
                        }
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ]);

            return mealPlans;
        } catch (error) {
            throw new Error(`Error fetching meal plans: ${error.message}`);
        }
    }

    async deleteMealPlan(id) {
        return await ClientMealPlan.findByIdAndDelete(id);
    }

    async updateMealPlanStatus(clientId, date, status) {


        try {
            console.log('clientId', clientId)
            console.log('date', date)
            console.log('status', status)
            const mealPlan = await ClientMealPlan.findOne({
                clientId,
                date: new Date(date),
            });

            if (!mealPlan) {
                console.log('Meal plan not found for the given date and clientId.');
                return null;
            }

            mealPlan.status = status;
            await mealPlan.save();

            const client = await Client.findById(clientId);
            if (client) {
                const mealPlansInRange = await ClientMealPlan.find({ clientId });
                const allCompleted = mealPlansInRange.every(plan => plan.status && plan.status === 'Not Completed' && plan.status === 'Completed');

                if (allCompleted) {
                    client.mealPlanStatus = 'Not Requested';
                    client.mealPlanStatusStartDate = null;
                    client.mealPlanStatusEndDate = null;
                } else {
                    client.mealPlanStatus = 'Assigned';
                }

                await client.save();
            }

            return mealPlan;
        } catch (error) {
            console.error('Error updating meal plan status:', error);
            throw new Error('Internal server error');
        }
    }
}

module.exports = new ClientMealPlanService();
