const asyncHandler = require('express-async-handler');
const apiLogServices = require('../resources/apiLog/apiLogServices');

const apiLogMiddleware = asyncHandler(async (req, res, next) => {
  if (req.url.startsWith(`/api/${process.env.VERSION}/encryption`)) {
    next();
    return;
  }
  const { method, body, query, params, url } = req;
  const request = { body, query, params };
  const newLog = await apiLogServices.create(url, method, request);
  req.logId = newLog._id;
  next();
});
module.exports = apiLogMiddleware;
