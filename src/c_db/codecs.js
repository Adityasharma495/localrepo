const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Codecs = sequelize.define(
  'codecs',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = Codecs;
