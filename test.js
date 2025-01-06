const io = require('socket.io-client');

const serverUrl = 'http://localhost:3030';

const socket = io(serverUrl);

socket.on('receiveMessage', (message) => {
    console.log('Received message from admin:', message);
});

socket.on('receiveReply', (updatedMessage) => {
    console.log('Received reply from admin:', updatedMessage);
});
socket.on('connect', () => {
    console.log('Connected to the server as client:', socket.id);

    const clientId = '6708da6e3abdc4eddb84ffd3';
    const content = 'Hello Admin, this is a test message!';

    socket.emit('sendMessage', { clientId, content });
    console.log('Sent message:', content);
});

setTimeout(() => {
    const messageId = '67124361123d915b40516108'; const adminId = '6704cbbd05c2b215e6ad4d5b';
    const replyContent = 'Hello Client, we received your message!';

    socket.emit('replyToMessage', { messageId, adminId, content: replyContent });
    console.log('Sent reply:', replyContent);
}, 5000);

// Handle disconnection
socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});
