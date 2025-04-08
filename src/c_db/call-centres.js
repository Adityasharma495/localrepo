const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const CallCentre = sequelize.define(
  "CallCentre",
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
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("domain", value.trim().toLowerCase());
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.UUID,
      references: {
        model: "companies",
        key: "id",
      },
    },
    country_code_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "country_code",
        key: "id",
      },
    },
    timezone_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "timezones",
        key: "id",
      },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
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
    tableName: "call_centres",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = CallCentre;
