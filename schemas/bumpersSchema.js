const mongoose = require('mongoose');
const config = require('../config.json');

const bumpSchema = new mongoose.Schema({
    _id: String,
    numberOfBumps: Number,
    streak: Number,
    lastBumped: Date
});

module.exports = mongoose.model('bumps', bumpSchema, config.mongoDB.bumpCollectionName);