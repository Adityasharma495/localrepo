const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { MODEL } = require('../utils/common/constants');

const FlowJson = sequelize.define(MODEL.FLOW_JSON, {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  call_center_id: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  flow_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  flow_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nodes_data: {
    type: DataTypes.JSON,
    allowNull: false
  },
  edges_data: {
    type: DataTypes.JSON,
    allowNull: false
  },
  type: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  re_prompt: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  schedule_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: MODEL.MEMEBER_SCHEDULES,
      key: 'id'
    }
  },
  is_gather_node: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: MODEL.USERS,
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  timestamps: false,  
  underscored: true,
  tableName: MODEL.FLOW_JSON,
  indexes: [
    {
      fields: ['flow_id']
    },
    {
      fields: ['call_center_id']
    },
    {
      fields: ['created_by']
    }
  ]
});

module.exports = FlowJson;