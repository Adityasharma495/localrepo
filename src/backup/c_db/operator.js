const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { constants } = require('../utils/common');
const OPERATOR_STATUS = constants.OPERATOR_STATUS;
const OPERATOR_MODEL_NAME = constants.MODEL.OPERATORS;
const USER_MODEL_NAME = constants.MODEL.USERS;


const Operator = sequelize.define(OPERATOR_MODEL_NAME, {
    id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true,
      },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        trim: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: OPERATOR_STATUS.ACTIVE,
        validate: {
            isIn: [Object.values(OPERATOR_STATUS)]
        }
    },
    created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: USER_MODEL_NAME,
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: () => {
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            return new Date(now.getTime() + istOffset);
        }
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: () => {
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            return new Date(now.getTime() + istOffset);
        }
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: false,
    hooks: {
        beforeCreate: (operator) => {
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istDate = new Date(now.getTime() + istOffset);
            operator.created_at = istDate;
            operator.updated_at = istDate;
        },
        beforeUpdate: (operator) => {
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            operator.updated_at = new Date(now.getTime() + istOffset);
        }
    }
});

module.exports = Operator;
