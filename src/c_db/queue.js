const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");

const USER_MODEL_NAME = constants.MODEL.USERS;
const EXTENSION = constants.MODEL.EXTENSION;
const QUEUE_MODEL_NAME = constants.MODEL.QUEUE;

const Queue = sequelize.define(
  QUEUE_MODEL_NAME,
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    extension: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "extensions",
        key: "id",
      },
    },
    max_wait_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    open_wrapup: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    default_wrapup_tag: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    wrapper_session_timeout: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now()),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now()),
    },
  },
  {
    tableName: QUEUE_MODEL_NAME,
    timestamps: false,
    underscored: true,
    // hooks: {
    //   beforeCreate: (queue) => {
    //     const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    //     queue.created_at = istDate;
    //     queue.updated_at = istDate;
    //   },
    //   beforeUpdate: (queue) => {
    //     queue.updated_at = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    //   }
    // }
  }
);

module.exports = Queue;
