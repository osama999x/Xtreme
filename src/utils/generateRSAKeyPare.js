const fs = require("fs");
const NodeRSA = require("node-rsa");

let publicKey, privateKey, key;

if (fs.existsSync("publicKey.pem") && fs.existsSync("privateKey.pem")) {
  publicKey = fs.readFileSync("publicKey.pem");
  privateKey = fs.readFileSync("privateKey.pem");
  key = new NodeRSA({ b: 512 });
  key.importKey(privateKey, "pkcs1-private-pem");
  key.importKey(publicKey, "pkcs1-public-pem");
  console.log("Keys already exist!");
} else {
  key = new NodeRSA({ b: 512 });
  publicKey = key.exportKey("pkcs1-public-pem");
  privateKey = key.exportKey("pkcs1-private-pem");
  fs.writeFileSync("publicKey.pem", publicKey);
  fs.writeFileSync("privateKey.pem", privateKey);
  console.log("Keys generated!");
}

module.exports = key;
