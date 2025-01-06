const CryptoJS = require('crypto-js');

const crypto = require('crypto');


const cryptkey = CryptoJS.enc.Utf8.parse(process.env.CRYPTKEY);

const cryptiv = CryptoJS.enc.Utf8.parse(process.env.CRYPTIV);
function encryptData(obj) {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(obj);

    // Encrypt the JSON string using CryptoJS
    const encrypted = CryptoJS.AES.encrypt(jsonString, cryptkey, {
        iv: cryptiv,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.Pkcs7,
    });

    // Return the cipher as a base64-encoded string
    const cipher = encrypted.toString() || '';
    return { cipher };
}

// Function to decrypt a base64-encoded cipher to an object
function decryptData(cipherText) {
    // Decrypt the cipher using CryptoJS
    const decrypted = CryptoJS.AES.decrypt(cipherText, cryptkey, {
        iv: cryptiv,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.Pkcs7,
    });

    // Convert the decrypted WordArray to a JSON string and then to an object
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    if (jsonString) {
        return JSON.parse(jsonString);
    }
    return null;
}

// const encryptData = (data) => {
//   var encrypt = CryptoJS.AES.encrypt(JSON.stringify(data), cryptkey, {
//     iv: cryptiv,
//     mode: CryptoJS.mode.CTR,
//   });
//   const cipher = encrypt.toString();
//   return { cipher };
// };

// const decryptData = (cipher) => {
//   const crypted = CryptoJS.enc.Base64.parse(cipher.toString()); //"Zt8VfHQqiKj/MToZGwWppw==");
//   console.log(crypted);
//   var decrypt = CryptoJS.AES.decrypt({ ciphertext: crypted }, cryptkey, {
//     iv: cryptiv,
//     mode: CryptoJS.mode.CTR,
//   });
//   const data = decrypt.toString(CryptoJS.enc.Utf8);
//   if (data) return JSON.parse(data);
//   return null;
// };

module.exports = { encryptData, decryptData };
