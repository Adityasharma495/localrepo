const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");
const USER_MODEL_NAME = constants.MODEL.USERS;

const Module = sequelize.define(
  "Module",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    module_name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.BIGINT,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "modules",
    timestamps: true,
    updatedAt: "updated_at",
    createdAt: "created_at",
    hooks: {
      beforeUpdate: (module) => {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        module.updated_at = new Date(now.getTime() + istOffset);
      },
    },
  }
);

module.exports = Module;
