const {
  decryptObject,
  encryptObject,
} = require('../utils/RSAEncryptionServices');
const { decryptData, encryptData } = require('../utils/AESEncryptionServices');
const asyncHandler = require('express-async-handler');

const encryptionMiddleware = asyncHandler((req, res, next) => {
  if (req.url.startsWith(`/api/${process.env.VERSION}/encryption`)) {
    next();
    return;
  }
  if (req.url.endsWith('zindigi/authenticate') || req.url.endsWith('/login')) {
    if (req.body && req.body.cipher) {
      try {
        console.log(req.body);
        const decrypted = decryptObject(req.body.cipher);
        req.body = decrypted;
      } catch (err) {
        console.log(err);
        return res.status(400).json({ error: 'Invalid request body' });
      }
    }
    console.log(req.body);

    // Encrypt response data
    if (res.json) {
      const originalJson = res.json;
      res.json = function (data) {
        const encrypted = encryptObject(data);
        return originalJson.call(this, encrypted);
      };
    }
  } else {
    if (req.body && req.body.cipher) {
      try {
        const decrypted = decryptData(req.body.cipher);
        req.body = decrypted;
      } catch (err) {
        console.log(err);
        return res.status(400).json({ error: 'Invalid request body' });
      }
    }

    // Encrypt response data
    if (res.json) {
      const originalJson = res.json;
      res.json = function (data) {
        const encrypted = encryptData(data);
        return originalJson.call(this, encrypted);
      };
    }
  }

  next();
});
module.exports = encryptionMiddleware;
