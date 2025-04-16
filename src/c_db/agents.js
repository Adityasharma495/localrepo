const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User'); // ✅ Import User model
const { constants } = require('../utils/common');

const ACCESS_CONTROL = constants.ACCESS_CONTROL;
const AGENT_TYPE = constants.AGENT_TYPE;
const AGENT_LOGIN_STATUS = constants.AGENT_LOGIN_STATUS;

const Agents = sequelize.define(
  'agents',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agent_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    agent_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    is_allocated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    telephony_profile: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    access: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [[ACCESS_CONTROL.ADMIN, ACCESS_CONTROL.REGULAR, ACCESS_CONTROL.GROUP_OWNER]],
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [[AGENT_TYPE.NORMAL, AGENT_TYPE.BROWSER_PHONE, AGENT_TYPE.SOFT_PHONE]],
      },
    },
    login_status: {
      type: DataTypes.STRING,
      defaultValue: AGENT_LOGIN_STATUS.INACTIVE,
    },
    email_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    call_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_call: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    versionKey: false,
  }
);

// ✅ Define Relationship in the Model File Too
Agents.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = Agents;
