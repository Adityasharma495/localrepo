const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); 
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;

const Prompt = sequelize.define('prompt', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  prompt_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prompt_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prompt_duration: {
    type: DataTypes.FLOAT, 
    defaultValue: 0,
    allowNull: false,
  },
  
  prompt_category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prompt_status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  approval_time: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: USER_MODEL_NAME,
      key: 'id',
    },
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'prompts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at', 
  hooks: {
    beforeCreate: (prompt) => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
      const istDate = new Date(now.getTime() + istOffset);
      prompt.created_at = istDate;
      prompt.updated_at = istDate;
    },
    beforeUpdate: (prompt) => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      prompt.updated_at = new Date(now.getTime() + istOffset);
    },
  },
});

module.exports = Prompt;