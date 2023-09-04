const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const MessageSchema = mongoose.Schema({
    chatId: {
        type: String,
        required: true,
    },
    from: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    to: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    message: {
        type: String,
        required: true,
    },

    sendAt: {
        type: Number,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);