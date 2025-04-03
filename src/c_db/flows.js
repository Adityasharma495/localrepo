const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { constants } = require('../utils/common');

const Flow = sequelize.define('flows', {
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
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  node_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  schedule_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: constants.MODEL.MEMEBER_SCHEDULES,
      key: 'id'
    }
  },
  flow_json: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  flow_render: {
    type: DataTypes.JSON,
    allowNull: false
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: constants.MODEL.USERS,
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
  tableName: 'flows',
  hooks: {
    beforeBulkCreate: (flows) => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; 
      const istDate = new Date(now.getTime() + istOffset);

      flows.forEach(flow => {
        flow.created_at = istDate;
        flow.updated_at = istDate;
      });
    }
  }
});

module.exports = Flow;