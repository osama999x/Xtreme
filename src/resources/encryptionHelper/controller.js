const asyncHandler = require('express-async-handler');
const {
  decryptObject,
  encryptObject,
} = require('../../utils/RSAEncryptionServices');
const {
  decryptData,
  encryptData,
} = require('../../utils/AESEncryptionServices');

const controller = {
  AESEncryptionController: asyncHandler(async (req, res) => {
    const data = req.body;
    const cipher = encryptData(data);
    res.send(cipher);
  }),
  AESDecryptController: asyncHandler(async (req, res) => {
    const { cipher } = req.body;
    const data = decryptData(cipher);
    res.send(data);
  }),
  RSAEncryptionController: asyncHandler(async (req, res) => {
    const data = req.body;
    const cipher = encryptObject(data);
    res.send(cipher);
  }),
  RSADecryptController: asyncHandler(async (req, res) => {
    const { cipher } = req.body;
    const data = decryptObject(cipher);
    res.send(data);
  }),
};
module.exports = controller;
