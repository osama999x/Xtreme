const asyncHandler = require('express-async-handler');
const adminUserServices = require('./adminUserServices');
const sendResponse = require('../../utils/sendResponse');
const adminUserValidator = require('./adminUserValidator');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const clientModel = require('../clients/clientModel')
const adminUserModel = require('./adminUserModel');
const adminUserController = {
    createAdminUser: asyncHandler(async (req, res) => {

        const validationResult = adminUserValidator.create.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const { email, profilePicture } = req.body;

        const existingAdminUser = await adminUserModel.findOne({ email });
        if (existingAdminUser) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                'Email already exists in Admin Users',
                null,
                req.logId
            );
        }
        const existingClient = await clientModel.findOne({ email });
        if (existingClient) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                'Email already exists in Clients',
                null,
                req.logId
            );
        }

        if (profilePicture) {
            const uploadedProfilePicture = await uploadFile(profilePicture);
            req.body.profilePicture = uploadedProfilePicture;
        }

        const adminUser = await adminUserServices.create(req.body);
        return await sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Admin User created successfully',
            adminUser,
            req.logId
        );
    }),

    updateAdminUser: asyncHandler(async (req, res) => {
        const validationResult = adminUserValidator.update.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }
        const { userId, email, mobile } = req.body;

        const validateMobile = await adminUserServices.getByMobile(mobile);
        if (validateMobile && validateMobile?._id.toString() !== userId) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                'Mobile number already registered against and other user',
                null,
                req.logId
            );
        }
        if (req.body.profilePicture !== null && req.body.profilePicture !== '') {
            const mealImage = await uploadFile(req.body.profilePicture);
            req.body.profilePicture = mealImage;
        }
        const validateEmail = await adminUserServices.getByEmail(email);
        if (validateEmail && validateEmail?._id.toString() !== userId) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                'Email number already registered against and other user',
                null,
                req.logId
            );
        }

        const updatedAdminUser = await adminUserServices.update(userId, req.body);
        if (updatedAdminUser) {
            return await sendResponse(
                res,
                responseStatusCodes.CREATED,
                'Admin User updated successfully',
                null,
                req.logId
            );
        } else {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                'Admin User Not found',
                null,
                req.logId
            );
        }
    }),

    getAllAdminUsers: asyncHandler(async (req, res) => {
        const adminUsers = await adminUserServices.getAll();
        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Admin Users retrieved successfully',
            adminUsers,
            req.logId
        );
    }),

    getAdminUserById: asyncHandler(async (req, res) => {
        const validationResult = adminUserValidator.getById.validate(req.params);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }
        const { id } = req.params;
        const adminUser = await adminUserServices.getById(id);

        if (!adminUser) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                'Admin Users not found',
                null,
                req.logId
            );
        }

        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Admin User retrieved successfully',
            adminUser,
            req.logId
        );
    }),

    updateStatus: asyncHandler(async (req, res) => {
        const validationResult = adminUserValidator.updateStatus.validate(req.body);
        if (validationResult.error) {
            validationResult.error.details[0].message,
                await sendResponse(
                    res,
                    BAD,
                    validationResult.error.details[0].message,
                    null,
                    req.logId
                );
            return;
        }
        const { id, isActive } = req.body;
        const update = await adminUserServices.updateStatus(id, isActive);
        if (!update) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'No admin found against provided info',
                null,
                req.logId
            );
        }
        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Activness Successfully changed',
            null,
            req.logId
        );
    }),

    deleteAdmin: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deleted = await adminUserServices.deleteAdmin(id);
        if (!deleted) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'No admin found against provided info',
                null,
                req.logId
            );
        }
        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Successfully deleted.',
            null,
            req.logId
        );
    }),
};

module.exports = adminUserController;
