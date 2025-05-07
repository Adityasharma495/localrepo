const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); 
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;

const DataCenter = sequelize.define('data_center', {
    id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
    },
    type: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    domestic_details: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
    },
    overseas_details: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
    },
    contact_person: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
    },
    contact_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    contact_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    data_centre_company: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    data_centre_address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    created_by: {
        type: DataTypes.BIGINT,
        references: {
            model: USER_MODEL_NAME,
            key: 'id',
        },
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true,
    underscored: true,
    tableName: 'data_centers',
});

DataCenter.beforeUpdate((dataCenter) => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    dataCenter.updatedAt = new Date(now.getTime() + istOffset);
});


module.exports = DataCenter;
