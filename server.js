require('dotenv').config()
const express = require('express');
const cors = require('cors');
const mongoDB = require('./src/databases/mongodb/index');
const socketIO = require('socket.io');
const shared = require('./src/shared');
const MessageController = require('./src/controllers/MessageController');
const app = express();
const RSA = require('./src/utils/encryption/PgpCrypt');
const UserController = require('./src/controllers/UserController');
const sessionController = require('./src/controllers/sessionController');
app.use(express.json());
app.use(cors());
const server = require('http').createServer(app);
const io = socketIO(server);
let users = [];


shared.io = io;
shared.users = users;

io.on('connection', async socket => {

    socket.on("new user", async(user) => await UserController.add_User_With_Socet(user,socket))
    socket.on("createUser",(data)=>UserController.create(data,socket) )
    socket.on('login',(data)=>UserController.login(data,socket))
    socket.on("getUsers", () =>UserController.getUsers(socket) );
    socket.on("getContacts", () => UserController.myContacts(socket) );
    socket.on("get-Chat",async (data) => await MessageController.getMessagesAndEmit(socket,data) );
    socket.on("disconnect", () =>UserController.remove_user_from_Socet(socket));

    socket.on("msg", async(data) => MessageController.sendWithAES(data,socket));
    socket.on("msg-AES", async(data) => MessageController.send(data,socket));
    socket.on("msg-PGB", async(data) => MessageController.sendWithPGB(data,socket));
    socket.on("msg-Rsa-Sign-Ver", async(data) => MessageController.sendWithRsa(data));
    
    //send to me encryptedSessionKey
    socket.on('newSessionKey', (data)=>sessionController.checkSessionKey(data,socket))
    socket.on('csr', (data)=>sessionController.sendCSR(socket))
});


app.use('/', require('./src/routes'));

server.listen('8081', () => {
    console.log("Listening on port 8081");
   

  
    mongoDB.connect();
    //Create CA With Keys Root 
     require('./level5/in_hous_ca');
    
     //create csr and verify it from OurCA
     require('./level5/index.js');
   RSA.getKeysOfServer();
   console.log(` OURCertificate :  ${process.env.ourCertificate}`);
   console.log(`PubCA : ${process.env.PubCA}`);
   console.log(`PrvCA : ${process.env.PrvCA}`);
   console.log(`CAPem : ${process.env.CAPem}`);
   console.log(`COPY Certificate : ${process.env.copyCertificate}`);

});
