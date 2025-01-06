// routes/meetingRoutes.js
const express = require('express');
const meetingRouter = express.Router();
const meetingController = require('./meetingController');


meetingRouter.post('/', meetingController.create);

meetingRouter.get('/client/:clientId', meetingController.getByClient);

meetingRouter.get('/admin/:adminId', meetingController.getByAdmin);

meetingRouter.get('/upComingMeeting', meetingController.getUpcomingMeetings);

meetingRouter.put('/:meetingId', meetingController.updateStatus);

meetingRouter.delete('/:meetingId', meetingController.delete);

module.exports = meetingRouter;
