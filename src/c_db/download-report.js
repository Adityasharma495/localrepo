const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");

const DownloadReport = sequelize.define(
  constants.MODEL.DOWNLOAD_REPORTS,
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    did: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: constants.MODEL.USERS,
        key: "id",
      },
    },
    requested_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updated_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return new Date(this.getDataValue("updated_date")).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
          }
        );
      },
    },
    report_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    download_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: constants.MODEL.USERS,
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return new Date(this.getDataValue("created_at")).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
          }
        );
      },
    },
  },
  {
    tableName: "download_reports",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_date",
  }
);

module.exports = DownloadReport;
