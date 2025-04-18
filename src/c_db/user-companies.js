const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const USER_MODEL_NAME = require('../utils/common').constants.MODEL.USERS;
const COMPANY_MODEL_NAME = require('../utils/common').constants.MODEL.COMPANIES;

const UserCompany = sequelize.define('user_companies', {
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: USER_MODEL_NAME,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: COMPANY_MODEL_NAME,
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = UserCompany;
