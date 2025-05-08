const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MODEL } = require('../utils/common/constants');
const IVR_DATA_MODEL= require("./ivr-data")
const IVR = sequelize.define(MODEL.IVR, {
  id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true
  },
  data_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: IVR_DATA_MODEL,
      key: 'id'
    }
  },
  input_action_data: {
    type: DataTypes.JSON,
    allowNull: false
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: MODEL.USERS,
      key: 'id'
    }
  },
  call_centre_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  menu_wait_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Menu wait time must not be 0.'
      }
    }
  },
  reprompt: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Reprompt must not be 0.'
      }
    }
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  timestamps: true,  
  underscored: true,  
  tableName: MODEL.IVR,
  defaultScope: {
    where: {
      is_deleted: false
    }
  }
});

module.exports = IVR;