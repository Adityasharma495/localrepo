const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Subscriber = sequelize.define('Subscriber', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ha1: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ha1b: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'subscriber',
  timestamps: false
});

module.exports = Subscriber;
