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

// Sequelize connection using environment variables
const sequelize = new Sequelize(ServerConfig.DB_NAME, ServerConfig.DB_USER, ServerConfig.DB_PASS, {
    host: ServerConfig.DB_HOST,
    dialect: ServerConfig.DB_DIALECT,
    logging: ServerConfig.DB_LOGGING,
});

const connectSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL connected successfully");
    } catch (error) {
        console.error("MySQL connection error:", error);
        throw error;
    }
};

module.exports = {
    connectMongo,
    connectSequelize,
    sequelize
};