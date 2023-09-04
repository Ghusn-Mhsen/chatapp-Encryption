const express = require('express');
const router = express.Router();

const UserController = require('./controllers/UserController');
const MessageController = require('./controllers/MessageController');

const userMiddleware = require('./middlewares/auths/user');


const PgpCrypt = require('./utils/encryption/PgpCrypt');

const middlewares = {
    auth: userMiddleware
}

router.get('/', (req, res) => {
   
    res.sendFile(__dirname + '/index.html')
});

router.post('/auth', UserController.login);

router.post('/user', UserController.create);
router.get('/users', [middlewares.auth], UserController.getUsers);
router.get('/contacts', [middlewares.auth], UserController.myContacts);
//router.post('/message', [middlewares.auth], MessageController.sendWithSAE);
router.get('/message/:id', [middlewares.auth], MessageController.get);
router.post('/hash',  MessageController.HashRestful);
router.post('/ChiperWithPublicKey', async(req,res)=>{
        const {data} = req.body;
      const encryptedData= PgpCrypt.encrypt(data);

       return res.json({
        encryptedKey:encryptedData
       })

});
router.post('/deChiperWithPublicKey', async(req,res)=>{
    const {data} = req.body;
  const encryptedData= PgpCrypt.decrypt(data);

   return res.json({
    decryptedKey:encryptedData
   })

});

router.post('/sing', async(req,res)=>{
    console.log("ggggggggggggggg");
    const {data} = req.body;

    console.log(req.body);
  const verify= PgpCrypt.isVerified(req.body.message,req.body.signature_message,req.body.PublicKey);

   return res.json({
    decryptedKey:verify
   })

});


module.exports = router;