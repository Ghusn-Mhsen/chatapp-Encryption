const crypto = require("crypto");
module.exports=function generatePairKeys() {


// The `generateKeyPairSync` method accepts two arguments:
// 1. The type ok keys we want, which in this case is "rsa"
// 2. An object with the properties of the key
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  // The standard secure default length for RSA keys is 515 bits
  modulusLength: 1024,
});
const exportedPublicKeyBuffer = publicKey.export({
    type: "pkcs1",
    format: "pem",
  });
  const exportedPrivateKeyBuffer = privateKey.export({
    type: "pkcs1",
    format: "pem",
  });
  

process.env.PrivateKey=exportedPrivateKeyBuffer;
process.env.PublicKey=exportedPublicKeyBuffer;
}