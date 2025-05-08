const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { constants } = require('../utils/common');

const DID_ALLOCATE_HISTORY_MODEL_NAME = constants.MODEL.DID_ALLOCATE_HISTORY;
const NUMBER_MODEL_NAME = constants.MODEL.NUMBERS;
const VOICE_PLAN_MODEL_NAME = constants.MODEL.VOICE_PLAN;

const DidAllocateHistory = sequelize.define(DID_ALLOCATE_HISTORY_MODEL_NAME, {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  DID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: NUMBER_MODEL_NAME,
      key: 'id',
    },
  },
  from_user: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  to_user: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  plan_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: VOICE_PLAN_MODEL_NAME,
      key: 'id',
    },
  },
  action: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get() {
      const rawValue = this.getDataValue('created_at');
      return rawValue ? new Date(rawValue.getTime() + 5.5 * 60 * 60 * 1000) : null;
    },
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get() {
      const rawValue = this.getDataValue('updated_at');
      return rawValue ? new Date(rawValue.getTime() + 5.5 * 60 * 60 * 1000) : null;
    },
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  freezeTableName: true,
});

module.exports = DidAllocateHistory;
