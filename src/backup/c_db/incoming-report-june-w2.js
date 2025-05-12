const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const IncomingReport = sequelize.define(
  'IncomingReport',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    call_sid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caller_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    callee_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bridge_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    billing_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    patch_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bridge_ring_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    answer_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dtmf: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pulses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dnd: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hangup_cause: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trunk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recording_file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recording_uploaded: {
      type: DataTypes.BOOLEAN,
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
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    agent_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    agent_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    agent_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    queue_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    queue_hold_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hold_last_start_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_hold_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    report_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'incoming_reports_june_w2',
    timestamps: false,
    hooks: {
      beforeCreate: (record) => {
        const now = new Date();
        const istDate = new Date(now.getTime());
        record.report_time = istDate;
      },
    },
  }
);

module.exports = IncomingReport;
