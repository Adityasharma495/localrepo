const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;

const Credit = sequelize.define(
  "credit_history",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
    },
    from_user: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
    },
    to_user: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
    },
    action_user: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
    },
    username: {
      type: DataTypes.STRING,
      default: null,
      trim: true,
    },
    req_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0.0,
      },
      defaultValue: 0.0,
    },
    credits: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0.0,
      },
      defaultValue: 0.0,
    },
    credits_rupees: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0.0,
      },
      defaultValue: 0.0,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['addition', 'deduction', 'inbound_deduction']] 
      }
    },    
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);



module.exports = Credit;
