const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const IVRSettings = sequelize.define('ivr_settings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  actions: {
    type: DataTypes.JSON,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  timestamps: false, 
  underscored: true,
  tableName: 'ivr_settings'
});

module.exports = IVRSettings;