// models/user_call_centres.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const USER_MODEL_NAME        = require('../utils/common').constants.MODEL.USERS;
const CALL_CENTRE_MODEL_NAME = require('../utils/common').constants.MODEL.CALL_CENTRES;  // adjust key if yours differs

const UserCallCentres = sequelize.define('user_call_centres', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: USER_MODEL_NAME,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  call_centre_id: {
    type:  DataTypes.INTEGER,  
    allowNull: false,
    primaryKey: true,
    references: {
      model: CALL_CENTRE_MODEL_NAME,
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  timestamps: false,
  freezeTableName: true,
});

module.exports = UserCallCentres;
