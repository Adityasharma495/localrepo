const ServerConfig = require('./server-config');
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

const connectMongo = async() => {
    try {
        await mongoose.connect(ServerConfig.MONGO_DB_URI);
    } catch (error) {
        throw error;
    }   
}

module.exports = connectMongo