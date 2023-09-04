const jwt = require('jsonwebtoken');
const config = require('../../config/jwt');
const err = require('../../controllers/errorController');

module.exports=(socket) => {

    const authHeader = socket.handshake.headers.token;
    

    if (!authHeader)
    return err(socket,{ error: 'No token provided' })
  

    const arrayAuth = authHeader.split(' ');
    if (arrayAuth.length != 2 || arrayAuth[0] != 'Bearer')
    return err(socket,{ error: 'The provided token is invalid' })
    

    const token = arrayAuth[1];
  
    let userId;
    let error;
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err){
            
          
            switch(err.name){

                case 'TokenExpiredError':
                    error = 'Expired token';
                    break;
                default:
                    error = 'Invalid token';
                    break;
            }
          return error
           
        }
     
       userId= decoded._id;

       
        
    });
  
    if(!error)
   return userId
   else{
   
   return err(socket,{ "error": error })
   }

}
