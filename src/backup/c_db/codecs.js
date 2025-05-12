const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Codec = sequelize.define(
  "Codec",
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
    tableName: "codecs",
    timestamps: false,
  }
);

module.exports = Codec;
