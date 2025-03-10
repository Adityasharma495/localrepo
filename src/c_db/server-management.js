const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { DATA_CENTER_TYPE } = require("../utils/common/constants");

const ServerManagement = sequelize.define(
  "server_management",
  {
    data_center_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [Object.values(DATA_CENTER_TYPE)],
      },
    },
    server_ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    server_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    os: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpu_cores: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ram: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hard_disk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      // references: {
      //     model: USER_MODEL_NAME,
      //     key: 'id'
      // }
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    timestamps: false,
    hooks: {
      beforeCreate: (instance) => {
        const now = new Date();
        const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        instance.created_at = istDate;
        instance.updated_at = istDate;
      },
      beforeUpdate: (instance) => {
        const now = new Date();
        const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        instance.updated_at = istDate;
      },
    },
  }
);

module.exports = ServerManagement;
