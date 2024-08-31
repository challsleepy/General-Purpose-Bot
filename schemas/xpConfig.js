const config = require('../config.json');
const mongoose = require('mongoose');

const xpConfig = new mongoose.Schema({
    _id: String,
    mowTournamentStatus: Boolean
})

module.exports = mongoose.model('XPConfig', xpConfig, config.mongoDB.xpCollectionName);