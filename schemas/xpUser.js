const mongoose = require('mongoose');

const xpUser = new mongoose.Schema({
    _id: String,
    current_xp: Number,
    current_level: Number,
})

module.exports = mongoose.model('XPUser', xpUser, 'xp-system');