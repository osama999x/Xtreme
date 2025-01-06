const CheckinStatus = require('./checkInStatusModel');

const checkinStatusService = {
    checkin: async (clientId) => {
        const newCheckin = new CheckinStatus({
            clientId,
            checkinTime: new Date(),
            checkoutTime: null,
        });
        return await newCheckin.save();
    },
    checkout: async (clientId) => {
        const newCheckout = new CheckinStatus({
            clientId,
            checkinTime: null,
            checkoutTime: new Date(),
        });
        return await newCheckout.save();
    },
    getAllByClient: async (clientId) => {
        return await CheckinStatus.find({ clientId }).sort({ checkinTime: -1 }).populate({ clientId: clientId });
    },
    getAllClient: async () => {
        try {
            const checkinStatuses = await CheckinStatus.aggregate([
                {
                    $lookup: {
                        from: 'clients',
                        localField: 'clientId',
                        foreignField: '_id',
                        as: 'client',
                    },
                },
                { $unwind: '$client' },
                {
                    $lookup: {
                        from: 'progressimages',
                        localField: 'clientId',
                        foreignField: 'clientId',
                        as: 'progressImages',
                    },
                },
                {
                    $addFields: {
                        progressImages: { $slice: ['$progressImages.images', -5] },
                    },
                },
                {
                    $project: {
                        clientId: 1,
                        checkinTime: 1,
                        checkoutTime: 1,
                        'client.name': 1,
                        'client.profilePicture': 1,
                        progressImages: 1,
                    },
                },
                { $sort: { checkinTime: -1 } },
            ]);

            return checkinStatuses;
        } catch (error) {
            console.error('Error fetching check-in statuses:', error);
            throw error;
        }
    }
};

module.exports = checkinStatusService;
