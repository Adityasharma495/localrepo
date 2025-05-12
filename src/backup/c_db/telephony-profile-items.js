const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MODEL } = require("../utils/common/constants");

const TelephonyProfileItem = sequelize.define("telephony_profile_items", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    telephony_profile_id: {
      type: DataTypes.BIGINT,
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
      type: DataTypes.JSON,
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