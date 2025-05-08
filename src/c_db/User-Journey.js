const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");
const USER_MODEL_NAME = constants.MODEL.USERS;

const UserJourney = sequelize.define(
  "user_journey",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    module_name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.BIGINT,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
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
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: (userJourney) => {
        const istOffset = 5.5 * 60 * 60 * 1000;
        userJourney.createdAt = new Date(Date.now() + istOffset);
        userJourney.updatedAt = new Date(Date.now() + istOffset);
      },
      beforeUpdate: (userJourney) => {
        const istOffset = 5.5 * 60 * 60 * 1000;
        userJourney.updatedAt = new Date(Date.now() + istOffset);
      },
    },
  }
);

module.exports = UserJourney;
