const apiLogServices = require('../resources/apiLog/apiLogServices');

const sendResponse = async (res, statusCode, message, data, logId) => {
    if (data && logId) {
        await apiLogServices.updateResponse(logId, message, data, statusCode);
    }


    if (res) {
        res.status(statusCode).send({ message, data, statusCode });
    } else {
        return { message, data, statusCode };
    }
};

module.exports = sendResponse;
