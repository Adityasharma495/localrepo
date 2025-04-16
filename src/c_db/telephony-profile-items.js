const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MODEL } = require("../utils/common/constants");

const TelephonyProfileItem = sequelize.define("telephony_profile_items", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    telephony_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: MODEL.TELEPHONY_PROFILE,
        key: "id",
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active_profile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    timestamps: false,
  });
  


  module.exports = TelephonyProfileItem