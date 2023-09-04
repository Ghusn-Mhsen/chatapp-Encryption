
// crypto module
const crypto = require("crypto");
const Hash = require('../hash');
const algorithm = "aes-256-cbc";

// generate 16 bytes of random data
const initVector = '1234567812345678'/*crypto.randomBytes(16)*/;

const secret = require('../../config/sha1').secret;
//const Securitykey =process.env.sessionKey/* crypto.createHash('md5').update(secret).digest('hex');*/// 16 Bytes and IV is 16 Bytes


class PgbAlg {



  EncryptData(message,Securitykey) {
    const encryptalgo = crypto.createCipheriv(algorithm, Securitykey, initVector);
    console.log(`sec is : ${Securitykey} iv : ${initVector.toString('hex')}`)
    let encrypted = encryptalgo.update(message, 'utf8', 'hex');
    encrypted += encryptalgo.final('hex');
    console.log(`encrept  : ${encrypted}`)
    return encrypted;

  }



  DycryptData(message,Securitykey) {
  
    console.log(`sec from Dy ${Securitykey}`)
    const decryptalgo = crypto.createDecipheriv(algorithm, Securitykey, initVector);
   
    let decrypted = decryptalgo.update(message, 'hex', 'utf8');
    
  
    decrypted += decryptalgo.final('utf8');
    
    return decrypted;



  }

  SymettricAlgrothim(data, socket) {

    const originalMac = data.mac;
    data.mac = undefined;
    const currentMac = Hash(data);

    if (originalMac != currentMac) {
      socket.emit('err', "Data Is Hacked")
    }


    const dycreptMsg = this.DycryptData(data.message)

    this.EncryptData(dycreptMsg)
  }


}
module.exports = new PgbAlg();