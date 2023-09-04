const Message = require('../models/MessageModel');
const ObjectId = require('mongoose').Types.ObjectId;

class MessageRepository {


    async create({ chatId, from, to, message }) {
        return await Message.create({
            chatId,
            from,
            to,
            message,
        });
    }

    async get(from, to) {
        console.log(from);
        console.log(to);
        return await Message.find({
            $or: [{ from: from, to: to },
                 {
                to: from,
                from: to
            }]
        }).populate('from').populate("to");
    }



    async delete(_id, userId) {
        await Message.findOneAndDelete({ _id, to: ObjectId(userId) });
    }

    async deleteReceivedMessages(myId) {
        await Message.deleteMany({ to: ObjectId(myId), triedToGet: true });
    }
    async getMyContacts(myId) {

        const result = await Message.find({
                $or: [{ from: myId }, { to: myId }]
            }).select({
                chatId: 1,
                username: 1,

            }).populate({
                path: 'from',

            })
            .populate({
                path: 'to',

            });
        return result;
    }


}

module.exports = new MessageRepository();