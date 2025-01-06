const passwordServices = require('../../utils/passwordServices');
const adminRoleServices = require('../../resources/role/roleServices');
const adminUserModel = require('./adminUserModel');

const adminUserServices = {
    create: async (data) => {
        data.password = await passwordServices.hash(data.password, 12);
        return await adminUserModel.create(data);
    },
    update: async (_id, data) => {
        delete data.userId;
        if (data.password)
            data.password = await passwordServices.hash(data.password, 12);
        else delete data.password;
        return await adminUserModel.findOneAndUpdate({ _id }, data, { new: true });
    },
    getAll: async () => {
        return await adminUserModel
            .find({ role: { $ne: '650411611e0de22bf0c42814' } }, { password: 0 })
            .populate({ path: 'role', select: 'uid title' });
    },
    getByEmail: async (email) => {
        const user = await adminUserModel
            .findOne({ email })
            .populate({ path: 'role', select: 'uid title' })
            .lean();
        // if (user) {
        //     const userRole = await adminRoleServices.getAdminRoleById(user.role._id);
        //     user.menu = userRole.modulePermissions.map(function (element) {
        //         return {
        //             label: element.module.name,
        //             icon: element.module.route,
        //             to: element.module.icon,
        //         };
        //     });
        //     user.modulesAndPermissions = userRole.modulePermissions.map(function (
        //         element
        //     ) {
        //         return {
        //             module: element.module.route,
        //             permissions: element.permissions,
        //         };
        //     });

        //     console.log(userRole);
        //     return user;
        // }
        return user;
    },

    getByMobile: async (mobile) => {
        return await adminUserModel.findOne({ mobile }).lean();
    },
    getById: async (id) => {
        return await adminUserModel.findById(id);
    },
    updateStatus: async (id, isActive) => {
        return await adminUserModel.findOneAndUpdate({ _id: id }, { isActive });
    },
    deleteAdmin: async (id) => {
        const result = await adminUserModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        return result;
    },
};

module.exports = adminUserServices;
