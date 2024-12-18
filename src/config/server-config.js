const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    SALT_WORK_FACTOR: Number(process.env.SALT_WORK_FACTOR),
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY
}