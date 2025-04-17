const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MODEL } = require("../utils/common/constants");
const USER_MODEL_NAME = require("../utils/common/constants").MODEL.USERS;

const TelephonyProfile = sequelize.define(MODEL.TELEPHONY_PROFILE, {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  profile: {
    type: DataTypes.JSONB,
    allowNull: true,
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
}, {
  tableName: MODEL.TELEPHONY_PROFILE,
  timestamps: false,
});

module.exports = TelephonyProfile;
