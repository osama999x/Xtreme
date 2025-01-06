const adminRoleModel = require('./adminRoleModel');

const adminRoleServices = {
    create: async (data) => {
        return await adminRoleModel.create(data);
    },

    update: async (roleId, data) => {
        return await adminRoleModel.findByIdAndUpdate(roleId, data, { new: true });
    },

    getAll: async () => {
        return await adminRoleModel.find({});
    },

    getById: async (id) => {
        return await adminRoleModel.findById(id);
    },
    getAdminRoleById: async (roleId) => {
        return await adminRoleModel.findOne({ _id: roleId }).lean();
    },

    deleteRole: async (id) => {
        return await adminRoleModel.findByIdAndDelete(id);
    },
};

module.exports = adminRoleServices;
