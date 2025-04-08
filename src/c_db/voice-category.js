const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const VoiceCategory = sequelize.define(
  "VoiceCategory",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    categories: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "voice_categories",
    timestamps: false,
  }
);

module.exports = VoiceCategory;
