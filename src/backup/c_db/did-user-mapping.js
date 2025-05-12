const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { constants } = require('../utils/common');

const DID_USER_MAPPING_MODEL_NAME = constants.MODEL.DID_USER_MAPPING;
const NUMBER_MODEL_NAME = constants.MODEL.NUMBERS;

const DIDUserMapping = sequelize.define(DID_USER_MAPPING_MODEL_NAME, {
  id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true
  },
  DID: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: NUMBER_MODEL_NAME,
      key: 'id',
    },
  },
  mapping_detail: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get() {
      const rawValue = this.getDataValue('created_at');
      return new Date(rawValue.getTime() + 5.5 * 60 * 60 * 1000); 
    },
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get() {
      const rawValue = this.getDataValue('updated_at');
      return new Date(rawValue.getTime() + 5.5 * 60 * 60 * 1000); 
    },
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  freezeTableName: true,
});

module.exports = DIDUserMapping;