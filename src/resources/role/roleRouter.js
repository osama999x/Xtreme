const express = require('express');
const adminRoleController = require('./roleController');

const adminRoleRouter = express.Router();

adminRoleRouter.route('/')
    .post(adminRoleController.createRole)
    .get(adminRoleController.getAllRoles)
    .put(adminRoleController.updateRole);

adminRoleRouter.route('/:id')
    .get(adminRoleController.getRoleById)
    .delete(adminRoleController.deleteRole);

module.exports = adminRoleRouter;
