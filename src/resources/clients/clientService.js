const clientModel = require('./clientModel');
const passwordServices = require('../../utils/passwordServices');
const adminUserModel = require('../adminUser/adminUserModel');
const systemNotificationServices = require('../systemNotifications/systemNotification');
const Recipe = require('../recipe/recipeModel');
const Meal = require('../meals/mealModel');
const clientServices = {
    create: async (data) => {
        try {

            const newClient = await clientModel.create(data);
            return newClient;
        } catch (error) {
            console.error('Error in client creation:', error);
            throw new Error('Failed to create client');
        }
    },
    getCounts: async () => {
        try {
            const activeClientCount = await clientModel.countDocuments({ isActive: true });

            const mealCount = await Meal.countDocuments();

            const recipeCount = await Recipe.countDocuments();

            return {
                activeClientCount,
                mealCount,
                recipeCount
            };
        } catch (error) {
            console.error('Error fetching counts:', error);
            throw error;
        }
    },

    getMonthlyClientStatusCount: async () => {
        try {
            const year = new Date().getFullYear();
            const result = await clientModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${year}-01-01`),
                            $lt: new Date(`${year + 1}-01-01`)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            status: "$status"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: { year: "$_id.year", month: "$_id.month" },
                        counts: {
                            $push: {
                                status: "$_id.status",
                                count: "$count"
                            }
                        }
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 }
                }
            ]);


            const monthlyCounts = Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const data = result.find(r => r._id.month === month);
                return {
                    year,
                    month,
                    Active: data?.counts.find(c => c.status === "Active")?.count || 0,
                    Expired: data?.counts.find(c => c.status === "Expired")?.count || 0,
                };
            });

            return monthlyCounts;
        } catch (error) {
            console.error("Error fetching monthly client status count:", error);
            throw error;
        }
    },
    // requestPlan: async (clientId, planType, startDate, endDate) => {
    //     const existingPlan = await clientModel.findOne({
    //         _id: clientId,
    //         [`${planType}PlanStatus`]: { $in: ['Requested', 'Assigned'] },
    //         [`${planType}PlanStatusStartDate`]: { $lte: endDate },
    //         [`${planType}PlanStatusEndDate`]: { $gte: startDate }
    //     });

    //     if (existingPlan) {
    //         throw new Error(
    //             `Client already has a ${existingPlan[`${planType}PlanStatus`]} ${planType} plan between ${startDate} and ${endDate}.`
    //         );
    //     }

    //     // Update the client's plan status and dates
    //     const updateFields = {
    //         [`${planType}PlanStatus`]: 'Requested',
    //         [`${planType}PlanStatusStartDate`]: startDate,
    //         [`${planType}PlanStatusEndDate`]: endDate
    //     };

    //     const updatedClient = await clientModel.findByIdAndUpdate(
    //         clientId,
    //         updateFields,
    //         { new: true }
    //     );

    //     const activeAdmins = await adminUserModel
    //         .find({ isActive: true, isDeleted: false })
    //         .select('fcmToken')
    //         .lean();

    //     const client = await clientModel.findById(clientId).select('name').lean();
    //     const clientName = client?.name || 'Unknown Client';

    //     const title = `${planType === 'workout' ? 'Workout' : 'Meal'} Plan Requested`;
    //     const body = `Client ${clientName} has requested a ${planType} plan from ${startDate} to ${endDate}`;

    //     for (const admin of activeAdmins) {
    //         if (admin.fcmToken) {
    //             await systemNotificationServices.systemNotification(
    //                 body,
    //                 title,
    //                 admin.fcmToken,
    //                 { clientId, planType, startDate, endDate }
    //             );
    //         }
    //     }

    //     return updatedClient;
    // }

    requestPlan: async (clientId, planType) => {

        const updateFields = {
            [`${planType}PlanStatus`]: 'Requested'
        };

        const updatedClient = await clientModel.findByIdAndUpdate(
            clientId,
            updateFields,
            { new: true }
        );

        const activeAdmins = await adminUserModel
            .find({ isActive: true, isDeleted: false })
            .select('fcmToken')
            .lean();

        const client = await clientModel.findById(clientId).select('name').lean();
        const clientName = client?.name || 'Unknown Client';

        const title = `${planType === 'workout' ? 'Workout' : 'Meal'} Plan Requested`;
        const body = `Client ${clientName} has requested a ${planType} plan.`;


        for (const admin of activeAdmins) {
            if (admin.fcmToken) {
                await systemNotificationServices.systemNotification(
                    body,
                    title,
                    admin.fcmToken,
                    { clientId, planType }
                );
            }
        }

        return updatedClient;
    }
    ,
    getByEmail: async (email) => {
        const user = await clientModel
            .findOne({ email })
            .lean();
        return user;
    },
    update: async (clientId, data) => {
        delete data.clientId;
        if (data.password) {
            data.password = await passwordServices.hash(data.password, 12);
        } else {
            delete data.password;
        }
        return await clientModel.findOneAndUpdate({ _id: clientId }, data, { new: true });
    },
    getAll: async () => {
        return await clientModel
            .find({})
            .populate({ path: 'createdBy', select: 'firstName lastName email' })
            .sort({ createdAt: -1 });

    },
    getById: async (id) => {
        return await clientModel.findById(id).populate({ path: 'createdBy', select: 'firstName lastName email' });
    },
    deleteClient: async (id) => {
        return await clientModel.findByIdAndDelete(id);
    },
};

module.exports = clientServices;
