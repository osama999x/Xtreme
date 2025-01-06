const asyncHandler = require('express-async-handler');
const adminRoleServices = require('./roleServices');
const sendResponse = require('../../utils/sendResponse');
const adminRoleValidator = require('./roleValidator');
const responseStatusCodes = require('../../constants/responseStatusCodes');

const adminRoleController = {
    createRole: asyncHandler(async (req, res) => {
        const validationResult = adminRoleValidator.create.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const role = await adminRoleServices.create(req.body);
        await sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Role created successfully',
            role,
            req.logId
        );
    }),

    updateRole: asyncHandler(async (req, res) => {
        const validationResult = adminRoleValidator.update.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const { roleId } = req.body;
        const updatedRole = await adminRoleServices.update(roleId, req.body);

        if (updatedRole) {
            await sendResponse(
                res,
                responseStatusCodes.OK,
                'Role updated successfully',
                updatedRole,
                req.logId
            );
        } else {
            await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Role not found',
                null,
                req.logId
            );
        }
    }),

    getAllRoles: asyncHandler(async (req, res) => {
        const roles = await adminRoleServices.getAll();
        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Roles retrieved successfully',
            roles,
            req.logId
        );
    }),

    getRoleById: asyncHandler(async (req, res) => {
        const validationResult = adminRoleValidator.getById.validate(req.params);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const role = await adminRoleServices.getById(req.params.id);
        if (!role) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Role not found',
                null,
                req.logId
            );
        }

        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Role retrieved successfully',
            role,
            req.logId
        );
    }),

    deleteRole: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deleted = await adminRoleServices.deleteRole(id);
        if (!deleted) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Role not found',
                null,
                req.logId
            );
        }

        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Role deleted successfully',
            null,
            req.logId
        );
    }),
};

module.exports = adminRoleController;
