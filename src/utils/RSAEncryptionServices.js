const crypto = require('crypto');
const { publicKey, privateKey } = require('./getKeys');

const blockSize = 20;

function encryptObject(data) {
  data = JSON.stringify(data);
  // list of encrypted cypher
  let cipher = [];
  if (data.length < blockSize) {
    const encryptedData = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
        oaepHash: 'sha512',
      },
      Buffer.from(data)
    );
    cipher.push(encryptedData.toString('base64'));
  } else {
    const stringLength =
      parseInt(data.length / blockSize) +
      (data.length % blockSize != 0 ? 1 : 0);

    /// encryption
    for (let index = 0; index < stringLength; index++) {
      if (index == data.length / blockSize) {
        const encryptedData = crypto.publicEncrypt(
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
            oaepHash: 'sha512',
          },
          Buffer.from(data.substring((index + 1) * blockSize))
        );
        cipher.push(encryptedData.toString('base64'));
      } else {
        const encryptedData = crypto.publicEncrypt(
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
            oaepHash: 'sha512',
          },
          Buffer.from(
            data.substring(index * blockSize, (index + 1) * blockSize)
          )
        );
        cipher.push(encryptedData.toString('base64'));
      }
    }
  }
  cipher = cipher.join(',');
  return { cipher: cipher || '' };
}

function decryptObject(cipher) {
  cipher = cipher.split(',');
  const decryptedCipher = [];
  for (let index = 0; index < cipher.length; index++) {
    const decryptData = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
        oaepHash: 'sha512',
      },
      Buffer.from(cipher[index], 'base64')
    );
    decryptedCipher.push(decryptData);
  }
  const obj = JSON.parse(decryptedCipher.join(''));
  return obj;
}

module.exports = { encryptObject, decryptObject };
