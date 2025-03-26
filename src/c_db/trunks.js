const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { constants } = require('../utils/common');
const AUTH_TYPES = constants.AUTH_TYPES;
const TRUNKS_STATUS = constants.TRUNKS_STATUS;
// const TRUNKS_MODEL_NAME = constants.MODEL.TRUNKS;
// const CODEC_MODEL = constants.MODEL.CODEC;
// const USER_MODEL_NAME = constants.MODEL.USERS;
// const OPERATOR_TYPES = constants.OPERATOR_TYPES;
// const OPERATOR_MODEL = constants.MODEL.OPERATORS;
// const SERVER_MODEL = constants.MODEL.SERVERMANAGEMENT;

const Trunks = sequelize.define(
  'trunks',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },
    auth_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [AUTH_TYPES]
      }
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
      trim: true
    },
    pilot_number: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },
    operator_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'operators',
        key: 'id'
      }
    },
    channels: {
      type: DataTypes.INTEGER,
      allowNull: false,
      trim: true
    },
    cps: {
      type: DataTypes.INTEGER,
      allowNull: false,
      trim: true
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: TRUNKS_STATUS.ACTIVE,
      validate: {
        isIn: [[TRUNKS_STATUS.ACTIVE, TRUNKS_STATUS.INACTIVE]]
      }
    },
    
    codec_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'codecs',
        key: 'id'
      }
    },
    auth_type_identify_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    auth_type_registration: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // server_id: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   references: {
    //     model: 'server_managements',
    //     key: 'id'
    //   }
    // },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    versionKey: false,
  }
);

module.exports = Trunks;
