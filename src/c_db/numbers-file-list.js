const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");

const NUMBER_FILES_LIST_MODEL_NAME = constants.MODEL.NUMBER_FILES_LIST;
const USER_MODEL_NAME = constants.MODEL.USERS;

const NumberFile = sequelize.define(NUMBER_FILES_LIST_MODEL_NAME, {
  id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: USER_MODEL_NAME,
      key: 'id',
    },
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  upload_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get() {
      const rawValue = this.getDataValue('upload_date');
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

module.exports = NumberFile;