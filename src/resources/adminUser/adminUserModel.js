const mongoose = require('mongoose');
const adminRoleServices = require('../../resources/role/roleServices');
const Schema = mongoose.Schema;

const adminUserSchema = new Schema(
    {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
        },
        googleId: { type: String, unique: true },
        role: {
            type: Schema.Types.ObjectId,
            ref: 'AdminRole',
        },
        mobile: {
            type: String,
        },
        gender: {
            type: String,
        },
        address: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isPasswordSecure: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        profilePicture: {
            type: String,
        },
        fcmToken: {
            type: String,
        }, otp: {
            type: String,
        },
        otpExpiry: {
            type: String,
        }
    },

    { timestamps: true }
);

// Prevent deletion of the last admin user
adminUserSchema.pre('findOneAndDelete', async function (next) {
    const activeAdminCount = await adminUserModel.countDocuments({ isDeleted: false, isActive: true });

    if (activeAdminCount <= 1) {
        throw new Error('You cannot delete the last active admin user');
    }

    next();
});

// Prevent marking the last admin user as deleted
adminUserSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    if (update.isDeleted === true || update.isActive === false) {
        const activeAdminCount = await adminUserModel.countDocuments({ isDeleted: false, isActive: true });

        if (activeAdminCount <= 1) {
            throw new Error('You cannot deactivate or delete the last active admin user');
        }
    }

    next();
});

adminUserSchema.pre('save', async function (next) {
    const adminUserCount = await adminUserModel.countDocuments();
    const role = await adminRoleServices.getAdminRoleById(this.role);

    if (!role) {
        throw new Error('Select another role');
    } else if (adminUserCount === 0) {

        next();
        return;
    } else if (role.name === 'superAdmin') {
        throw new Error('You cannot assign the superAdmin role');
    }

    next();
});

const adminUserModel = mongoose.model('AdminUser', adminUserSchema);

module.exports = adminUserModel;
