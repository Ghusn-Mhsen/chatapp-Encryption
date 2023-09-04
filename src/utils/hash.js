const crypto = require('crypto');
const secret = require('../config/sha1').secret;

module.exports = (data) =>
    crypto.createHmac('sha1', secret).update(`${data.message}${data.from}${data.to}`).digest('hex');