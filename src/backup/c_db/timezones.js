const { DataTypes } = require('sequelize');
const { MODEL } = require('../utils/common/constants');
const sequelize = require('../config/sequelize'); 

const Timezone = sequelize.define(MODEL.TIMEZONES, {
  id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timezoneSchema: {
    type: DataTypes.STRING,
    allowNull: false
  },
  offset: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isdst: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  utc: {
    type: DataTypes.JSON, 
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: MODEL.TIMEZONES
});

module.exports = Timezone;
