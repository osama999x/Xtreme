// notificationRoutes.js
const express = require('express');
const notificationController = require('./notificationController');
const NotificationRouter = express.Router();

NotificationRouter.post('/create', notificationController.createNotification);
NotificationRouter.get('/:id', notificationController.getNotificationById);
NotificationRouter.get('/client/:clientId', notificationController.getNotificationsForClient);
NotificationRouter.get('/admin/:adminId', notificationController.getNotificationsForAdmin);
NotificationRouter.put('/:id/mark-as-read', notificationController.markAsRead);

module.exports = NotificationRouter;
