const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MODEL } = require('../utils/common/constants');

const IVRData = sequelize.define(MODEL.IVR_DATA, {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  data: {
    type: DataTypes.JSON,  
    allowNull: false
  }
}, {
  timestamps: false,  
  tableName: MODEL.IVR_DATA  
   
});

module.exports = IVRData;