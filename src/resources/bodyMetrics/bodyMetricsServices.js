const BodyMetrics = require('./bodyMetricsModel');

const bodyMetricsService = {
    create: async (data) => {
        const bodyMetrics = new BodyMetrics(data);
        return await bodyMetrics.save();
    },

    update: async (id, updates) => {
        return await BodyMetrics.findByIdAndUpdate(id, updates, { new: true });
    },

    delete: async (id) => {
        return await BodyMetrics.findByIdAndDelete(id);
    },

    getById: async (id) => {
        return await BodyMetrics.findById(id).populate('clientId', 'name email');
    },

    getAllByClient: async (clientId) => {
        return await BodyMetrics.find({ clientId }).sort({ createdAt: -1 });
    },
};

module.exports = bodyMetricsService;
