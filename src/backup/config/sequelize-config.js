const { Sequelize } = require('sequelize');

// Sequelize connection using environment variables
const sequelize = new Sequelize('kamailio_ct', 'dev', 'ns@4044888', {
    host: '64.227.131.75',
    dialect: 'mysql',
    logging: false,
    timezone: '+05:30',
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
    connectSequelize,
    sequelize
};