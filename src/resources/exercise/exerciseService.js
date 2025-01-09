const exerciseModel = require('./exerciseModel');

const exerciseServices = {
    create: async (data) => {
        return await exerciseModel.create(data);
    },

    update: async (id, data) => {
        return await exerciseModel.findByIdAndUpdate(id, data, { new: true });
    },

    getAll: async () => {
        return await exerciseModel.find().sort({ createdAt: -1 });
    },

    getById: async (id) => {
        return await exerciseModel.findById(id);
    },

    delete: async (id) => {
        return await exerciseModel.findByIdAndDelete(id);
    },
};

module.exports = exerciseServices;
