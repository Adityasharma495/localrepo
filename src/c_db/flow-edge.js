const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { MODEL } = require('../utils/common/constants');

const FlowEdges = sequelize.define(MODEL.FLOWS_EDGES, {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  flow_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  edge_json: {
    type: DataTypes.JSON,
    allowNull: false
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
  tableName: MODEL.FLOWS_EDGES,
  hooks: {
    beforeUpdate: (instance) => {
      instance.updated_at = new Date();
    }
  }
});

module.exports = FlowEdges;