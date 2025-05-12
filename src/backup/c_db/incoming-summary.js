const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");

const IncomingSummary = sequelize.define(
  constants.MODEL.INCOMING_SUMMARY,
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    did: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: constants.MODEL.USERS,
        key: "id",
      },
    },
    schedule_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    nos_processed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_nos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dnd_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    pulses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    connected_calls: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dtmf_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dtmf1_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dtmf2_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    parent_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: constants.MODEL.USERS,
        key: "id",
      },
    },
    parent_pulse_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    s_parent_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: constants.MODEL.USERS,
        key: "id",
      },
    },
    s_parent_pulse_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    pulse_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    auto_retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sms_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    parent_pulses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    s_parent_pulses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    parent_refund: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    s_parent_refund: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    billing_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tts_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    webhook_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return new Date(this.getDataValue("updated_at")).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
          }
        );
      },
    },
  },
  {
    tableName: constants.MODEL.INCOMING_SUMMARY,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = IncomingSummary;
