const express = require('express');
const {
  AESEncryptionController,
  AESDecryptController,
  RSAEncryptionController,
  RSADecryptController,
} = require('./controller');
const Router = express.Router();

Router.route('/AESEncryption').post(AESEncryptionController);
Router.route('/AESDecryption').post(AESDecryptController);
Router.route('/RSAEncryption').post(RSAEncryptionController);
Router.route('/RSADecryption').post(RSADecryptController);

module.exports = Router;
