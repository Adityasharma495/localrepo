const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const CountryCode = sequelize.define(
  "CountryCode",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      trim: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      trim: true,
      set(value) {
        this.setDataValue("code", value.toUpperCase());
      },
    },
    calling_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return new Date(this.getDataValue("created_at")).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
      },
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return new Date(this.getDataValue("updated_at")).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
      },
    },
  },
  {
    tableName: "country_code",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = CountryCode;
