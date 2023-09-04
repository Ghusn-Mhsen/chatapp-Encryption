
const shared = require('../shared');
const PgpCrypt = require('../utils/encryption/PgpCrypt');
require('dotenv').config()
class Session{


   checkSessionKey (data,socket){
    const dycryptedData=  PgpCrypt.decrypt(data.SessionKey);
          
   
    
     const findUser= shared.users.filter(x => x.socket.id == socket.id)
   
     findUser[0].user.sessionKey=dycryptedData;
    
     socket.emit('Acceptance-session-key',{
        "Accept":true
    })
    
    }

    sendCSR (socket){
      
        
         socket.emit('Acceptance-csr',{
            "csr":process.env.ourCertificate,
            "sign":process.env.copyCertificate
        })
        
        }

}
module.exports=new Session()