const express = require('express');
const { adminLogin, logout } = require('./adminAuthenticationController');
const adminAuthenticationRouter = express.Router();

adminAuthenticationRouter.route('/login').post(adminLogin);
adminAuthenticationRouter.route('/logout').post(logout);

module.exports = adminAuthenticationRouter;
