const mongoose = require('mongoose');
const config = require('../config.json');

const bumpConfigSchema = new mongoose.Schema({
    _id: String,
    lastBumper: String
});

module.exports = mongoose.model('BumpConfig', bumpConfigSchema, config.mongoDB.bumpCollectionName);