const mongoose = require('mongoose');
const config = require('../config.json');

const countSchema = new mongoose.Schema({
    _id: String,
    currentCount: Number,
    currentCountAuthorId: String
});

module.exports = mongoose.model('count', countSchema, config.mongoDB.countersCollectionName);