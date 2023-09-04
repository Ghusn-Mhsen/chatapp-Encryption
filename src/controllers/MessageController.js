

const Hash = require('../utils/hash');
const MessageRepository = require('../repositories/MessageRepository');
const shared = require('../shared/index');
const err = require('./errorController');
const Symmetric = require('../utils/encryption/symmetricCrypt');
const auth=require('../middlewares/auths/user')
const PgpCrypt = require('../utils/encryption/PgpCrypt');
const SessionEncryption=require('../utils/encryption/level3')
class MessageController {


    async send(data, socket) {
        try {

            const { to, message, from } = data;
 
        

        
          
           
       


            const lowerId = from < to ? from : to;
            const higherId = from > to ? from : to;

            const chatId = Hash({ lowerId, higherId });


            const sentMessage = await MessageRepository.create({
                chatId,
                from,
                to,
                message
            });

            await sentMessage.populate('from').populate('to').execPopulate();


         

          
           data.mac = Hash(data)


           

            const users = shared.users;
            const findUsers = users.filter(user => (user.user.id == to ));
            findUsers.forEach(user => {
                user.socket.emit('message',
                sentMessage
                    // username: sentMessage.chatId
                );
            })



        } catch (e) {
           
            console.log(e)
            socket.emit("err", `there are probleme during send message : ${e}`)
        }
    }

    async sendWithAES(data, socket) {
        try {

            const { to, message, from } = data;
 
        

        
           Symmetric.checkMac(data, socket); 
           
           const dycryptedMessage = Symmetric.DycryptData(message)
          
           const encryptedData = Symmetric.EncryptData(dycryptedMessage)
        


            const lowerId = from < to ? from : to;
            const higherId = from > to ? from : to;

            const chatId = Hash({ lowerId, higherId });


            const sentMessage = await MessageRepository.create({
                chatId,
                from,
                to,
                message: dycryptedMessage
            });

            await sentMessage.populate('from').populate('to').execPopulate();


         

          
           data.mac = Hash(data)


           sentMessage.message=message

            const users = shared.users;
            const findUsers = users.filter(user => (user.user.id == to ));
            findUsers.forEach(user => {
                user.socket.emit('message',
                sentMessage
                    // username: sentMessage.chatId
                );
            })



        } catch (e) {
            // console.log(e);
            // const users = shared.users;
            // const userTemp = users.filter(user => (user.user.id == data.from));
            console.log(e)
            socket.emit("err", `there are probleme during send message : ${e}`)
        }
    }
   
    async sendWithPGB(data) {
        try {

            const { to, message, from } = data;
 
            

        
         
            const users = shared.users;
          
        const fromUser = users.filter(user => (user.user.id==from ));

       
        const toUser = users.filter(user => (user.user.id == to ));
     
           const dycryptedMessage = SessionEncryption.DycryptData(message,fromUser[0].user.sessionKey)
        
           const encryptedData = SessionEncryption.EncryptData(dycryptedMessage,toUser[0].user.sessionKey)
        


            const lowerId = from < to ? from : to;
            const higherId = from > to ? from : to;

            const chatId = Hash({ lowerId, higherId });


            const sentMessage = await MessageRepository.create({
                chatId,
                from,
                to,
                message: dycryptedMessage
            });

            await sentMessage.populate('from').populate('to').execPopulate();


         
          
            data.mac = ""


        sentMessage.message=encryptedData
           
            const findUsers = users.filter(user => (user.user.id == to ));
            findUsers.forEach(user => {
                user.socket.emit('message',
                sentMessage
                    // username: sentMessage.chatId
                );
            })



        } catch (e) {
            // console.log(e);
            // const users = shared.users;
            // const userTemp = users.filter(user => (user.user.id == data.from));
            console.log(e)
            socket.emit("err", `there are probleme during send message : ${e}`)
        }
    }
async sendWithRsa(data, socket) {
        try {

            const { to, message, from } = data;
 
            

        
         
            const users = shared.users;
          
        const fromUser = users.filter(user => (user.user.id==from ));

       
        const toUser = users.filter(user => (user.user.id == to ));
     
           const dycryptedMessage = SessionEncryption.DycryptData(message,fromUser[0].user.sessionKey)
        
           const encryptedData = SessionEncryption.EncryptData(dycryptedMessage,toUser[0].user.sessionKey)
        


            const lowerId = from < to ? from : to;
            const higherId = from > to ? from : to;

            const chatId = Hash({ lowerId, higherId });


            let sentMessage = await MessageRepository.create({
                chatId,
                from,
                to,
                message: dycryptedMessage
            });

            await sentMessage.populate('from').populate('to').execPopulate();


         
          
            data.mac = ""


        sentMessage.message=encryptedData
       
  
           
        
            const findUsers = users.filter(user => (user.user.id == to ));
            findUsers.forEach(user => {
                user.socket.emit('message',
                {sentMessage:sentMessage,
                pubKey:data.pubKey,
                signature:data.signature
                }
                    // username: sentMessage.chatId
                );
            })

        } catch (e) {
           
            console.log(e)
            socket.emit("err", `there are probleme during send message : ${e}`)
        }
    }
    async get(req, res) {
        try {

            const myId = req._id;
            const anthorId = req.params.id;
            const messages = await MessageRepository.get(myId, anthorId);



            return res.json({
                messages
            })

        } catch (e) {
            return res.json({
                error: true,
                errorMessage: e
            })
        }
    }

    async getMessagesAndEmit(Socket,data) {
        try {

            const myId = auth(Socket);
         

            const messages = await MessageRepository.get(myId,data.userId);

          

            Socket.emit('chat-message', { messages });



        } catch (e) {
            return Socket.emit('err', `Error happend in get-messages : ${e}`)
        }
    }

    async delete(req, res) {
        try {

            const messageId = req.params.id;
            const myId = req._id;

            await MessageRepository.delete(messageId, myId);

            return res.json({
                success: true
            })

        } catch (e) {
            return res.json({
                error: true,
                errorMessage: e
            })
        }
    }

    async deleteReceivedMessages(req, res) {
        try {

            const myId = req._id;

            await MessageRepository.deleteReceivedMessages(myId);

            return res.json({
                success: true
            })

        } catch (e) {
            console.error(e);
            return res.json({
                error: true,
                e
            })
        }
    }
    async HashRestful(req, res) {


        const hashedData = Hash(req.body)
        res.json({

            hasedData: hashedData
        })
    }


}

module.exports = new MessageController();