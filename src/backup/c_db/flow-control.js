const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const FlowControl = sequelize.define('flow_controls', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  node_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: false
  },
  next_node: {
    type: DataTypes.INTEGER
   
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  timestamps: false, 
  underscored: true,  
  tableName: 'flow_controls'
});

module.exports = FlowControl;