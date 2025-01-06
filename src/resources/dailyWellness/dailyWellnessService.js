const DailyWellness = require('./dailyWellnessModel');

const dailyWellnessService = {
    create: async (data) => {
        const dailyWellness = new DailyWellness(data);
        return await dailyWellness.save();
    },

    update: async (id, updates) => {
        return await DailyWellness.findByIdAndUpdate(id, updates, { new: true });
    },

    delete: async (id) => {
        return await DailyWellness.findByIdAndDelete(id);
    },

    getById: async (id) => {
        return await DailyWellness.findById(id).populate('clientId', 'name email');
    },

    getAllByClient: async (clientId) => {
        return await DailyWellness.find({ clientId }).sort({ createdAt: -1 });
    },
};

module.exports = dailyWellnessService;
