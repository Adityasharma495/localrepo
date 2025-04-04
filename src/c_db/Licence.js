const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { USER_MODEL_NAME } = require('../utils/common/constants');
const User = require('./User'); 

const Licence = sequelize.define('licences', {
    user_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User, 
            key: 'id'
        }
    },
    total_licence: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    available_licence: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_by: {
        type: DataTypes.UUID,
        references: {
            model: User, 
            key: 'id'
        },
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true // also recommended
  });

// Hook for trimming strings
Licence.beforeValidate((licence, options) => {
    if (licence.user_type) {
        licence.user_type = licence.user_type.trim();
    }
});

// Hook to handle timestamps conversion to IST
Licence.beforeCreate((licence, options) => {
    adjustISTTimestamps(licence);
});

Licence.beforeUpdate((licence, options) => {
    adjustISTTimestamps(licence, false);
});

function adjustISTTimestamps(licence, isNew = true) {
    const now = new Date();
    const istOffset = 5.5 * 3600 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    if (isNew) {
        licence.createdAt = istDate;
    }
    licence.updatedAt = istDate;
}

module.exports = Licence;

