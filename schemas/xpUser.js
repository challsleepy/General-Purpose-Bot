const config = require('../config.json');
const mongoose = require('mongoose');

const xpUser = new mongoose.Schema({
    _id: String,
    current_xp: Number,
    current_level: Number,
    mowPoints: Number,
    votesLeft: Number,
    votes: Number,
    votedMembers: Array,
    displayHex: String,
    displayURL: String,
    displayName: String,
    rankCard: {
        progressBarColor: String,
        background: String,
        unlockedBackgrounds: Array,
        candyColor: String
    }
});

module.exports = mongoose.model('XPUser', xpUser, config.mongoDB.xpCollectionName);