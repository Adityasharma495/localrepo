const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("name", value.trim().toLowerCase());
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("phone", value.trim());
      },
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("pincode", value.trim());
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("address", value.trim());
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [["type_reseller", "type_cadmin", "type_sadmin"]],
      },
    },
    created_by: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        const raw = this.getDataValue("created_at");
        return raw
          ? new Date(raw).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
          : null;
      },
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        const raw = this.getDataValue("updated_at");
        return raw
          ? new Date(raw).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
          : null;
      },
    },
  },
  {
    tableName: "companies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Company;
