const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");

const NUMBER_STATUS_MODEL_NAME = constants.MODEL.NUMBER_STATUS;
const USER_MODEL_NAME = constants.MODEL.USERS;

const NumberStatus = sequelize.define(NUMBER_STATUS_MODEL_NAME, {
  id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: USER_MODEL_NAME,
      key: 'id',
    },
  },
  expiry_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get() {
      const rawValue = this.getDataValue('expiry_date');
      return new Date(rawValue.getTime() + 5.5 * 60 * 60 * 1000);  
    },
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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

module.exports = NumberStatus;
