const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const CallStrategy = sequelize.define(
  "call_strategies",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    strategies: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "call_strategies",
    timestamps: false,
  }
);

module.exports = CallStrategy;
