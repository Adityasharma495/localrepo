 const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { constants } = require('../utils/common'); 

const MemberSchedule = sequelize.define("MemberSchedule", {
  id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true
  },
  start_time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  week_days: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    validate: {
      areValidDays(value) {
        const allowed = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const invalid = value.filter(day => !allowed.includes(day));
        if (invalid.length > 0) {
          throw new Error(`Invalid day(s): ${invalid.join(', ')}`);
        }
      }
    }
  },
  module_id: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: "member_schedules",  
  timestamps: false,  
});

module.exports = MemberSchedule;
