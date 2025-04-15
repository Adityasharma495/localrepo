const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");
const USER_MODEL_NAME = constants.MODEL.USERS;
const { MODEL } = require("../utils/common/constants");

const TelephonyProfile = sequelize.define(
  MODEL.TELEPHONY_PROFILE,
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    profile: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: MODEL.TELEPHONY_PROFILE,
    timestamps: false,
  }
);

module.exports = TelephonyProfile;
