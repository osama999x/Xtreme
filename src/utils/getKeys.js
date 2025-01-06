const fs = require("fs");
publicKey = fs.readFileSync("publicKey.pem").toString();
privateKey = fs.readFileSync("privateKey.pem").toString();
module.exports = { publicKey, privateKey };
