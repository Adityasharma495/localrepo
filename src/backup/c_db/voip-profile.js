const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const { MODEL } = require('../utils/common/constants');

const VoipProfile = sequelize.define(MODEL.VOIP_PROFILE, {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'SIP',
    validate: {
      isIn: [['SIP', 'WEBRTC']] 
    }
  },
  host: {
    type: DataTypes.STRING,
    allowNull: false
  },
  websocket_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  stun_servers: {
    type: DataTypes.JSON,  
    allowNull: true
  },
  turn_servers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: USER_MODEL_NAME,
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: MODEL.VOIP_PROFILE,
  timestamps: false
});

module.exports = VoipProfile;
