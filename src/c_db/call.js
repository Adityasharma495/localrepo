const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");
const CALLS_MODEL_NAME = constants.MODEL.CALLS;
const USER_MODEL_NAME = constants.MODEL.USERS;

const Call = sequelize.define(
  CALLS_MODEL_NAME,
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    did: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caller_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    answer_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    patch_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    billing_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dtmf: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dnd: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    call_sid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pulses: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hangup_cause: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trunk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    callee_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bridge_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bridge_ring_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    recording_file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recording_uploaded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    caller_profile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now()),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now()),
    },
  },
  {
    tableName: CALLS_MODEL_NAME,
    timestamps: false,
    underscored: true,
    //   hooks: {
    //     beforeCreate: (call) => {
    //       const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    //       call.created_at = istNow;
    //       call.updated_at = istNow;
    //     },
    //     beforeUpdate: (call) => {
    //       call.updated_at = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    //     }
    //   }
  }
);

module.exports = Call;
