const apiLogModel = require('./apiLogModel');

const apiLogServices = {
  create: async (url, requestType, request) => {
    const newLog = await apiLogModel.create({ url, requestType, request });
    return newLog;
  },
  updateResponse: async (_id, message, response, responseCode) => {
    const updatedLog = await apiLogModel.findOneAndUpdate(
      { _id },
      { message, response, responseCode },
      { new: true }
    );
    return updatedLog;
  },
};
module.exports = apiLogServices;
