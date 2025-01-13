const asyncHandler = require('express-async-handler');
const adminAuthenticationValidator = require('./adminAuthenticationValidator');
const { BAD, SUCCESS, UNAUTHORIZED, OK } = require('../../constants/responseStatusCodes');
const passwordServices = require('../../utils/passwordServices');
const { OAuth2Client } = require('google-auth-library');
const jwtServices = require('../../utils/jwtServices');
const sendResponse = require('../../utils/sendResponse');
const AdminUser = require('../adminUser/adminUserModel');
const Client = require('../clients/clientModel');
require('dotenv').config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleAuthService = require('../../utils/googleAuthService');


const adminAuthenticationController = {
    // adminLogin: asyncHandler(async (req, res) => {
    //     // Validate the login request
    //     const validationResult = adminAuthenticationValidator.adminLogin.validate(req.body);
    //     if (validationResult.error) {
    //         return await sendResponse(
    //             res,
    //             BAD,
    //             validationResult.error.details[0].message,
    //             null,
    //             req.logId
    //         );
    //         return;
    //     }

    //     const { email, password, fcmToken } = req.body;

    //     const adminUser = await AdminUser.findOne({ email });
    //     const clientUser = await Client.findOne({ email });

    //     if (adminUser) {
    //         const validatePassword = await passwordServices.authenticate(password, adminUser.password);
    //         if (validatePassword) {
    //             if (fcmToken) {
    //                 adminUser.fcmToken = fcmToken;
    //                 await adminUser.save();
    //             }
    //             delete adminUser.password;
    //             const accessToken = jwtServices.create({ adminId: adminUser._id });
    //             const data = { adminUser, accessToken };
    //             return await sendResponse(res, OK, 'Admin Logged In', data, req.logId);
    //         } else {
    //             return await sendResponse(
    //                 res,
    //                 UNAUTHORIZED,
    //                 'Authentication failed',
    //                 null,
    //                 req.logId
    //             );
    //         }
    //     }

    //     else if (clientUser) {
    //         const validatePassword = await passwordServices.authenticate(password, clientUser.password);
    //         if (validatePassword) {
    //             if (fcmToken) {
    //                 clientUser.fcmToken = fcmToken;
    //                 clientUser.lastLogin = Date.now();
    //                 await clientUser.save();
    //             }
    //             delete clientUser.password;
    //             const accessToken = jwtServices.create({ clientId: clientUser._id });
    //             const data = { clientUser, accessToken };
    //             return await sendResponse(res, OK, 'Client Logged In', data, req.logId);
    //         } else {
    //             return await sendResponse(
    //                 res,
    //                 UNAUTHORIZED,
    //                 'Authentication failed',
    //                 null,
    //                 req.logId
    //             );
    //         }
    //     }
    //     else {
    //         return await sendResponse(
    //             res,
    //             UNAUTHORIZED,
    //             'Authentication failed',
    //             null,
    //             req.logId
    //         );
    //     }
    // }),
    adminLogin: asyncHandler(async (req, res) => {
        const validationResult = adminAuthenticationValidator.adminLogin.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const { email, password, fcmToken, googleToken } = req.body;

        // If googleToken is provided, process Google login
        if (googleToken) {
            try {
                const googleData = await googleAuthService.verifyGoogleToken(googleToken);

                // Check if user exists as AdminUser or Client
                const adminUser = await AdminUser.findOne({ email: googleData.email });
                const clientUser = await Client.findOne({ email: googleData.email });

                if (adminUser) {
                    if (fcmToken) {
                        adminUser.fcmToken = fcmToken;
                        await adminUser.save();
                    }
                    const accessToken = jwtServices.create({ adminId: adminUser._id });
                    const data = { adminUser, accessToken };
                    return await sendResponse(res, OK, 'Admin Logged In via Google', data, req.logId);
                } else if (clientUser) {
                    if (fcmToken) {
                        clientUser.fcmToken = fcmToken;
                        clientUser.lastLogin = Date.now();
                        await clientUser.save();
                    }
                    clientUser.lastLogin = Date.now();
                    await clientUser.save();
                    const accessToken = jwtServices.create({ clientId: clientUser._id });
                    const data = { clientUser, accessToken };
                    return await sendResponse(res, OK, 'Client Logged In via Google', data, req.logId);
                } else {
                    // Register new user (optional: decide if Google login should auto-create accounts)
                    const newClient = await Client.create({
                        name: googleData.name,
                        email: googleData.email,
                        googleId: googleData.googleId,
                        profilePicture: googleData.profilePicture,
                        fcmToken,
                    });
                    const accessToken = jwtServices.create({ clientId: newClient._id });
                    const data = { newClient, accessToken };
                    return await sendResponse(res, OK, 'Client Registered and Logged In via Google', data, req.logId);
                }
            } catch (error) {
                return await sendResponse(
                    res,
                    UNAUTHORIZED,
                    'Google Login Failed',
                    null,
                    req.logId
                );
            }
        }

        // Standard login process (email/password)
        const adminUser = await AdminUser.findOne({ email });
        const clientUser = await Client.findOne({ email });

        if (adminUser) {
            const validatePassword = await passwordServices.authenticate(password, adminUser.password);
            if (validatePassword) {
                if (fcmToken) {
                    adminUser.fcmToken = fcmToken;
                    await adminUser.save();
                }
                delete adminUser.password;
                const accessToken = jwtServices.create({ adminId: adminUser._id });
                const data = { adminUser, accessToken };
                return await sendResponse(res, OK, 'Admin Logged In', data, req.logId);
            } else {
                return await sendResponse(
                    res,
                    UNAUTHORIZED,
                    'Authentication failed',
                    null,
                    req.logId
                );
            }
        } else if (clientUser) {
            const validatePassword = await passwordServices.authenticate(password, clientUser.password);
            if (validatePassword) {
                if (fcmToken) {
                    clientUser.fcmToken = fcmToken;
                    clientUser.lastLogin = Date.now();
                    await clientUser.save();
                }
                delete clientUser.password;
                const accessToken = jwtServices.create({ clientId: clientUser._id });
                const data = { clientUser, accessToken };
                return await sendResponse(res, OK, 'Client Logged In', data, req.logId);
            } else {
                return await sendResponse(
                    res,
                    UNAUTHORIZED,
                    'Authentication failed',
                    null,
                    req.logId
                );
            }
        } else {
            return await sendResponse(
                res,
                UNAUTHORIZED,
                'Authentication failed',
                null,
                req.logId
            );
        }
    }),
    logout: asyncHandler(async (req, res) => {
        const { email } = req.body;

        const adminUser = await AdminUser.findOne({ email });
        const clientUser = await Client.findOne({ email });

        if (adminUser) {
            adminUser.fcmToken = null;
            await adminUser.save();

            return await sendResponse(res, OK, 'Logged out ', null, req.logId);
        }

        else if (clientUser) {
            clientUser.fcmToken = null;
            await clientUser.save();

            return await sendResponse(res, OK, 'Logged out ', null, req.logId);
        }

        else {
            return await sendResponse(
                res,
                UNAUTHORIZED,
                'User not found or already logged out',
                null,
                req.logId
            );
        }
    })
};

module.exports = adminAuthenticationController;
