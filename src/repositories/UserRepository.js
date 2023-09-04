const User = require('../models/UserModel');
const ObjectId = require('mongoose').Types.ObjectId;

class UserRepository {

    async create({ phone, username, password }) {
        await User.create({
            phone,
            username,
            password,
        });
    }

    async findByPhone(phone) {
        return await User.findOne({ phone }).select({ 'phone': 1, 'username': 1, 'password': 1 });
    }

    async getUsersWhereNot(userId) {
        return await User.find({ _id: { $ne: ObjectId(userId) } });
    }

    async getUserByName(myId, name) {
        return await User.find({
            _id: { $ne: ObjectId(myId), name }
        });
    }


    async getChatId(_id) {
        return await User.findOne({ _id }).select({ 'chatId': 1 });
    }




}

module.exports = new UserRepository();