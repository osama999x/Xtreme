const meetingService = require('./meetingService');
const meetingValidator = require('./meetingValidator');
const sendResponse = require('../../utils/sendResponse');
const asyncHandler = require('express-async-handler');
const MeetingModel = require('./meetingModel');

class MeetingController {
    // getUpcomingMeetings = asyncHandler(async (req, res) => {
    //     const currentDate = new Date();

    //     const upcomingMeetings = await MeetingModel.find({
    //         meetingDate: { $gte: currentDate },
    //         status: { $in: ['Pending', 'Confirmed'] }
    //     })
    //         .populate('clientId', 'name')
    //         .lean();

    //     const totalCount = upcomingMeetings.length;

    //     return sendResponse(
    //         res,
    //         200,
    //         'All upcoming meetings retrieved successfully',
    //         { totalCount, meetings: upcomingMeetings }
    //     );
    // });

    getUpcomingMeetings = asyncHandler(async (req, res) => {
        try {
            const currentDate = new Date();

            console.log('Current Date:', currentDate);


            const upcomingMeetings = await MeetingModel.find({
                meetingDate: { $gte: currentDate },
                status: { $in: ['Pending', 'Confirmed'] }
            })
                .populate('clientId', 'name')
                .lean();

            console.log('Upcoming Meetings:', upcomingMeetings);


            if (!upcomingMeetings || upcomingMeetings.length === 0) {
                return sendResponse(
                    res,
                    200,
                    'No upcoming meetings found',
                    { totalCount: 0, meetings: [] }
                );
            }

            const totalCount = upcomingMeetings.length;

            return sendResponse(
                res,
                200,
                'All upcoming meetings retrieved successfully',
                { totalCount, meetings: upcomingMeetings }
            );
        } catch (error) {
            console.error('Error retrieving upcoming meetings:', error);

            return sendResponse(
                res,
                500,
                'An error occurred while retrieving upcoming meetings',
                null
            );
        }
    });

    create = asyncHandler(async (req, res) => {
        await meetingValidator.create.validateAsync(req.body);
        const { clientId, meetingDate, meetingTime, notes } = req.body;
        const meeting = await meetingService.createMeeting(clientId, meetingDate, meetingTime, notes);
        return sendResponse(res, 201, 'Meeting created successfully', meeting);
    });

    getByClient = asyncHandler(async (req, res) => {
        await meetingValidator.getByClient.validateAsync(req.params);
        const { clientId } = req.params;
        const meetings = await meetingService.getMeetingsByClient(clientId);
        return sendResponse(res, 200, 'Meetings retrieved successfully', meetings);
    });

    getByAdmin = asyncHandler(async (req, res) => {
        await meetingValidator.getByAdmin.validateAsync(req.params);
        const { adminId } = req.params;
        const meetings = await meetingService.getMeetingsByAdmin(adminId);
        return sendResponse(res, 200, 'Meetings retrieved successfully', meetings);
    });

    updateStatus = asyncHandler(async (req, res) => {
        await meetingValidator.updateStatus.validateAsync(req.body);
        const { meetingId } = req.params;
        const { status } = req.body;
        const updatedMeeting = await meetingService.updateMeetingStatus(meetingId, status);
        return sendResponse(res, 200, 'Meeting status updated successfully', updatedMeeting);
    });

    delete = asyncHandler(async (req, res) => {
        await meetingValidator.delete.validateAsync(req.params);
        const { meetingId } = req.params;
        await meetingService.deleteMeeting(meetingId);
        return sendResponse(res, 200, 'Meeting deleted successfully');
    });
}

module.exports = new MeetingController();
