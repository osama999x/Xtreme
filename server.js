const http = require('http');
const dotenv = require('dotenv');
const { log, logLevels } = require('./src/utils/logger');
const app = require('./app');
const socketConnection = require('./socket');
const clc = require('cli-color');

dotenv.config();
const PORT = process.env.PORT || 3030;

const server = http.createServer(app);

const io = socketConnection(server);

server.listen(PORT, () => {
    log(logLevels.INFO, clc.green(`Server is running on port ${PORT}`));
});

module.exports = server;
