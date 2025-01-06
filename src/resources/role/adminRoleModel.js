const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import the UUID function
const Schema = mongoose.Schema;

const adminRoleSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        uid: {
            type: String,
            required: true,
            unique: true,
            default: uuidv4, // Use the UUID function to set a default value
        },
        description: {
            type: String,
        },
        permissions: [
            {
                type: String, // Add permission structure as needed, e.g., 'module:view', 'module:edit'
            }
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const adminRoleModel = mongoose.model('AdminRole', adminRoleSchema);

module.exports = adminRoleModel;
