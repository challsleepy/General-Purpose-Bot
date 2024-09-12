const config = require('../config.json');
const mongoose = require('mongoose');

const countSchema = new mongoose.Schema({
    _id: String,
    displayName: String,
    totalCounts: Number
});

module.exports = mongoose.model('countUser', countSchema, config.mongoDB.countersCollectionName);