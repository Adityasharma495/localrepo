const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Language = sequelize.define('Language', {
    id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
    },
    language: {
        type: DataTypes.JSONB,
        allowNull: false
    }
}, {
    tableName: 'languages',
    timestamps: false
});

module.exports = Language;
