
const UserRepository = require('../repositories/UserRepository');
const MsgRepository = require('../repositories/MessageRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');
const shared = require('../../src/shared/index');
const err = require('./errorController');
const generate_Key = require('../utils/encryption/privite_Key');
const auth = require('../middlewares/auths/user');
const Sym = require('../utils/encryption/symmetricCrypt');

function generateJwtToken(user) {
    const { _id } = user;
    return jwt.sign({
        _id,
    }, jwtConfig.secret);
}


class UserController {


    async create(data, socket) {
        try {
            const { phone, username, password } = data;

            if (!phone || !username || !password)
                return err(socket, "invalid Input")

            const userExists = (await UserRepository.findByPhone(phone)) != null;

            if (userExists) {
                return err(socket, "User is Already Registered")
            }

            await UserRepository.create({ phone, username, password, });

            const newUser = await UserRepository.findByPhone(phone);

            const token = generateJwtToken(newUser);
            newUser.password = undefined;


            await this.add_User_With_Socet(newUser, socket)
            const users = shared.users;
            const findUsers = users.filter(user => (user.user.id == newUser._id));
            findUsers.forEach(user => {
                user.socket.emit('Reg-Success', {
                    user: newUser,
                    token
                })
            })


        } catch (err) {
            socket.emit("err", `error-During-SignUp: ${err}`)
        }
    }


    async login(data, socket) {
        try {
            console.log("i am login")
            const { phone, password } = data;

            if (!phone || !password) 
                return err(socket, "invalid Input")
            

            const user = await UserRepository.findByPhone(phone);

            if (!user) 
                return err(socket, "This User Is not found")
          

            if (!await bcrypt.compare(password, user.password)) 
                return err(socket, "wrong password")

            
            const token = generateJwtToken(user);

            user.password = undefined;

            socket.emit('log-Success', {
                user: user,
                token
            })
        } catch (err) {
            socket.emit("err", `error-During-login: ${err}`)
        }
    }


    async getUsers(socket) {
        try {
            console.log(socket.handshake);

            const myId = auth(socket);
            

            let users = await UserRepository.getUsersWhereNot(myId);

            return socket.emit('All-Users', {
                users: users
            })

        } catch (err) {
            return socket.emit("err", `error-During-get-All-Users ${err}`)
        }
    }


    async myContacts(socket) {
        try {
            const myId = auth(socket);

            const users = await MsgRepository.getMyContacts(myId);


            return socket.emit('my-Contacts', {
                users: users
            })
        } catch (err) {
            return socket.emit("err", `error-During-get-My-Contatcts: ${err}`)
        }
    }

     add_User_With_Socet(newUser, socket) {

        

        if (shared.users.filter(x => x.socket.id == socket.id).length == 0) {
        
          
          
           const user = { username: newUser.username, phone: newUser.phone, id: newUser.id}
          
        
            shared.users.push({ user, socket })

            socket.emit("user-in", { PublicKey: process.env.PublicKey });
        }

    }


    async remove_user_from_Socet(socket) {
        shared.users = shared.users.filter(x => x.socket.id !== socket.id);
    }

   
}

module.exports = new UserController();