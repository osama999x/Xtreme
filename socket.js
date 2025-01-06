const mongoose = require('mongoose');
const socket = require('socket.io');
const app = require('./app');
const MessageService = require('./src/resources/message/messageService');
const Client = require('./src/resources/clients/clientModel');
const AdminUser = require('./src/resources/adminUser/adminUserModel');
const { log, logLevels } = require('./src/utils/logger');
const clc = require('cli-color');

const userSockets = {};

const socketConnection = (server) => {
    const io = socket(server, {
        cors: { origin: '*' },
    });

    app.set('io', io);
    console.log(clc.yellow('Socket.io is initialized and waiting for connections...'));


    io.on('connection', (socket) => {
        console.log(clc.green('New socket connected:'), socket.id);

        socket.on('registerUser', async (user) => {
            const userId = user.clientId || user.adminId;

            if (user.clientId) {
                const clientRoom = `room_client_${user.clientId}`;
                socket.join(clientRoom);
                userSockets[user.clientId] = socket.id;

                const client = await Client.findById(user.clientId);
                const clientName = client ? client.name : 'Unknown Client';

                console.log(clc.blue(`Client ${clientName} (ID: ${user.clientId}) registered and joined room:`), clc.yellow(clientRoom));

                const messages = await MessageService.getMessagesBetweenClientAndAdmin(user.clientId);
                socket.emit('pastMessages', messages);

            } else if (user.adminId) {
                userSockets[user.adminId] = socket.id;
                console.log(clc.magenta(`Admin ${user.adminId} registered with socket ID:`), clc.yellow(socket.id));
            } else {
                console.log(clc.red('Invalid user object received:'), user);
            }
        });

        socket.on('joinClientRoom', async ({ adminId, clientId }) => {
            const clientRoom = `room_client_${clientId}`;
            socket.join(clientRoom);


            const admin = await AdminUser.findById(adminId);
            const client = await Client.findById(clientId);
            const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'Unknown Admin';
            const clientName = client ? client.name : 'Unknown Client';

            console.log(clc.green(`Admin ${adminName} joined room for client ${clientName}:`), clc.yellow(clientRoom));

            const messages = await MessageService.getMessagesBetweenClientAndAdmin(clientId);
            socket.emit('pastMessages', messages);
        });

        socket.on('clientMessage', async (data) => {
            const { clientId, message } = data;
            const clientRoom = `room_client_${clientId}`;

            try {
                const chatMessage = await MessageService.saveClientMessage(clientId, message);
                console.log(clc.blue('Client message saved:'), clc.green(chatMessage.message));

                io.to(clientRoom).emit('newClientMessage', {
                    clientId,
                    message: chatMessage.message,
                    timestamp: chatMessage.timestamp
                });

                console.log(clc.cyan('Emitted newClientMessage event with message:'), clc.green(chatMessage.message));

                socket.emit('messageSent', { message: chatMessage.message, timestamp: chatMessage.timestamp });

                const updatedMessages = await MessageService.getMessagesBetweenClientAndAdmin(clientId);
                io.to(clientRoom).emit('pastMessages', updatedMessages);

            } catch (error) {
                console.error(clc.red('Error saving message or emitting events:'), error);
            }
        });

        socket.on('adminMessage', async (data) => {
            const { clientId, adminId, message } = data;
            const clientRoom = `room_client_${clientId}`;

            try {
                const chatMessage = await MessageService.saveAdminMessage(clientId, adminId, message);
                console.log(clc.magenta('Admin message saved:'), clc.green(chatMessage.message));

                io.to(clientRoom).emit('newAdminMessage', {
                    clientId,
                    adminId,
                    message: chatMessage.message,
                    timestamp: chatMessage.timestamp,
                });

                console.log(clc.cyan('Emitted newAdminMessage event with message:'), clc.green(chatMessage.message));

                const updatedMessages = await MessageService.getMessagesBetweenClientAndAdmin(clientId);
                io.to(clientRoom).emit('pastMessages', updatedMessages);

            } catch (error) {
                log(logLevels.ERROR, clc.red('Failed to save admin message:'), error);
                socket.emit('errorReply', clc.red('An error occurred while saving the admin message.'));
            }
        });
        socket.on('adminInitiateConversation', async (data) => {
            try {
                const { clientId, adminId, message } = data;

                const client = await Client.findById(clientId);
                if (!client) {
                    socket.emit('errorReply', 'Client not found');
                    return;
                }

                const clientRoom = `room_client_${clientId}`;

                const chatMessage = await MessageService.saveAdminMessage(clientId, adminId, message);
                console.log(clc.magenta('Admin initiated conversation, message saved:'), clc.green(chatMessage.message));
                io.to(clientRoom).emit('newAdminMessage', {
                    clientId,
                    adminId,
                    message: chatMessage.message,
                    timestamp: chatMessage.timestamp,
                });

                socket.emit('messageSent', { message: chatMessage.message, timestamp: chatMessage.timestamp });

                const updatedMessages = await MessageService.getMessagesBetweenClientAndAdmin(clientId);
                io.to(clientRoom).emit('pastMessages', updatedMessages);

            } catch (error) {
                log(logLevels.ERROR, clc.red('Failed to initiate conversation or send admin message:'), error);
                socket.emit('errorReply', 'An error occurred while initiating the conversation.');
            }
        });
        socket.on('disconnect', () => {
            log(logLevels.INFO, clc.yellow('Socket disconnected:'), socket.id);

            for (const [userId, socketId] of Object.entries(userSockets)) {
                if (socketId === socket.id) {
                    delete userSockets[userId];
                    console.log(clc.red(`User unregistered: ${userId}`));
                    break;
                }
            }
        });


    });
};

module.exports = socketConnection;
