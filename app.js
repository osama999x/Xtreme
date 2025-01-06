// Importing core dependencies
const path = require('path');
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const cron = require('node-cron');
require('dotenv').config();

// Initialize app and version
const app = express();
const version = process.env.VERSION;

// Import utilities, middleware, and helpers
const sendResponse = require('./src/utils/sendResponse');
const encryptionMiddleware = require('./src/middleware/encryptionMiddleware');
const loggingMiddleware = require('./src/middleware/loggingMiddleware');
const apiLogMiddleware = require('./src/middleware/apiLogMiddleWare');
const responseStatusCodes = require('./src/constants/responseStatusCodes');
const { setupSwagger } = require('./swagger');
const errorHandler = require('./src/middleware/errorHandler');
const { checkSubscriptionsAndSendEmails } = require('./src/utils/sendWeeklyEmails');
const { updateSubscriptionStatuses } = require('./src/resources/subscription/subscriptionModel');
const Client = require('./src/resources/clients/clientModel');
const sendNotification = require('./src/resources/systemNotifications/sendNotification');

// Import Routers
const encryptionHelperRouter = require('./src/resources/encryptionHelper/router');
const adminUserRouter = require('./src/resources/adminUser/adminUserRouter');
const adminAuthenticationRouter = require('./src/resources/authentication/adminAuthentictionRouter');
const adminRoleRouter = require('./src/resources/role/roleRouter');
const clientRouter = require('./src/resources/clients/clientRouter');
const exerciseRouter = require('./src/resources/exercise/exerciseRouter');
const mealRouter = require('./src/resources/meals/mealRouter');
const workoutPlanRouter = require('./src/resources/workout/workoutPlanRouter');
const recipeRouter = require('./src/resources/recipe/recipeRouter');
const messageRouter = require('./src/resources/message/messageRouter');
const FitnessRouter = require('./src/resources/fitnessQuestionares/fitnessQuestionaresRouter');
const clientMealPlanRouter = require('./src/resources/clientMealPlan/clientMealPlanRouter');
const meetingRouter = require('./src/resources/meeting/meetingRouter');
const subscriptionRouter = require('./src/resources/subscription/suscriptionRouter');
const NotificationRouter = require('./src/resources/notifications/notificationRouter');
const { createCharge, handleWebhook } = require('./src/utils/stripe');
const BodyMetricsRouter = require('./src/resources/bodyMetrics/bodyMetricsRouter');
const checkInRouter = require('./src/resources/checkInStatus/checkInStatusRouter');
const clientProgressImagesRouter = require('./src/resources/clientProgressImages/progressImageRouter')
const clientNotes = require('./src/resources/clientNotes/clientNoteRouter');
const dailyWellnessRouter = require('./src/resources/dailyWellness/dailyWellnessRouter');
const ChatGPT = require('./src/utils/gpt');
const calendlyRouter = require('./src/resources/oAuthCalendly/oAuthRouter');
// Database connection
require('./src/config/db');

// Setup Middleware
app.use(cors());
app.use(logger('dev'));
app.use(loggingMiddleware);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Apply encryption and logging middleware in non-dev environments
if (process.env.NODE_ENV !== 'dev') {
    app.use(encryptionMiddleware);
    app.use(apiLogMiddleware);
}

// Set up Swagger
setupSwagger(app);

// Define Routes
app.get('/', (req, res) => {
    res.send({ message: 'Xtreme-Api Server...' });
});

app.use(`/api/${version}/encryption`, encryptionHelperRouter);
app.use(`/api/${version}/adminAuthentication`, adminAuthenticationRouter);
app.use(`/api/${version}/adminUser`, adminUserRouter);
app.use(`/api/${version}/role`, adminRoleRouter);
app.use(`/api/${version}/client`, clientRouter);
app.use(`/api/${version}/exercise`, exerciseRouter);
app.use(`/api/${version}/auth`, adminAuthenticationRouter);
app.use(`/api/${version}/meal`, mealRouter);
app.use(`/api/${version}/workout`, workoutPlanRouter);
app.use(`/api/${version}/recipe`, recipeRouter);
app.use(`/api/${version}/messages`, messageRouter);
app.use(`/api/${version}/fitness`, FitnessRouter);
app.use(`/api/${version}/clientMeal`, clientMealPlanRouter);
app.use(`/api/${version}/meeting`, meetingRouter);
app.use(`/api/${version}/subscription`, subscriptionRouter);
app.use(`/api/${version}/notification`, NotificationRouter);
app.use(`/api/${version}/bodyMetrics`, BodyMetricsRouter);
app.use(`/api/${version}/checkIn`, checkInRouter);
app.use(`/api/${version}/clientProgressImages`, clientProgressImagesRouter);
app.use(`/api/${version}/clientNotes`, clientNotes);
app.use(`/api/${version}/dailyWellness`, dailyWellnessRouter);
app.use(`/api/${version}/calendly`, calendlyRouter);


// Schedule cron jobs
cron.schedule("0 0 * * 0", () => {
    console.log("Running weekly email check");
    checkSubscriptionsAndSendEmails();
});

cron.schedule('0 0 * * *', () => {
    console.log('Updating subscription statuses...');
    updateSubscriptionStatuses();
});

// cron.schedule('*/2 * * * *', () => {
//     console.log('Updating subscription statuses...');
//     updateSubscriptionStatuses();
// });



// Error handling for unknown routes
app.use(async (req, res, next) => {
    await sendResponse(
        res,
        responseStatusCodes.NOTFOUND,
        'Not Found',
        null,
        req.logId
    );
});

// Global error handler
app.use(async (err, req, res, next) => {
    console.log(err);
    await sendResponse(
        res,
        responseStatusCodes.SERVER,
        err.message,
        null,
        req.logId
    );
});

// Uncomment below to send sample notifications to all clients with FCM tokens
// const sendSampleNotificationToAllClients = async () => {
//     try {
//         const clients = await Client.find({ fcmToken: { $exists: true, $ne: null } });
//         if (clients.length === 0) {
//             console.log('No clients with an FCM token found.');
//             return;
//         }
//         const title = 'Xtreme Fitness App';
//         const body = 'Something4';
//         const data = { message: 'Sample notification from Xtreme Fitness app' };
//         for (const client of clients) {
//             try {
//                 const fcmToken = client.fcmToken;
//                 const response = await sendNotification(title, body, fcmToken, data);
//                 console.log(`Notification sent to ${client.name}:`, response);
//             } catch (error) {
//                 console.error(`Failed to send notification to client ${client.name}:`, error);
//             }
//         }
//     } catch (error) {
//         console.error('Error fetching clients or sending notifications:', error);
//     }
// };
// sendSampleNotificationToAllClients();

// Use global error handler
app.use(errorHandler);

module.exports = app;
