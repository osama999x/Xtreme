const express = require('express');
const {
  createAdminUser,
  getAllAdminUsers,
  updateAdminUser,
  getAdminUserById,
  deleteAdmin,
  updateStatus,
} = require('./adminUserController');
const adminUserRouter = express.Router();

adminUserRouter
  .route('/')
  .post(createAdminUser)
  .get(getAllAdminUsers)
  .put(updateAdminUser);

adminUserRouter.route('/updateStatus').patch(updateStatus);
adminUserRouter.route('/:id').get(getAdminUserById).delete(deleteAdmin);
module.exports = adminUserRouter;
