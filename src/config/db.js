const mongoose = require('mongoose');
const clc = require('cli-color');

const logLevels = {
    INFO: 'info',
    ERROR: 'error'
};

const log = (level, message) => {
    switch (level) {
        case logLevels.INFO:
            console.log(clc.green(`[INFO]: ${message}`));
            break;
        case logLevels.ERROR:
            console.log(clc.red(`[ERROR]: ${message}`));
            break;
        default:
            console.log(clc.white(`[LOG]: ${message}`));
    }
};

mongoose
    .connect(process.env.DATABASE)
    .then(() => {
        log(logLevels.INFO, 'Database connected.');
    })
    .catch((err) => {
        log(logLevels.ERROR, err.message);
    });

module.exports = { log, logLevels };
