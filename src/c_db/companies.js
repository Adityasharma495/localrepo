const { DataTypes } = require('sequelize');
const { constants } = require('../utils/common');
const sequelize = require("../config/sequelize");
const USER_MODEL_NAME = constants.MODEL.USERS;
const COMPANY_MODEL_NAME = constants.MODEL.COMPANIES;

const Company = sequelize.define(COMPANY_MODEL_NAME, {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['type_reseller', 'type_cadmin', 'type_sadmin']] 
    }
  },    
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: USER_MODEL_NAME,
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  credits_available: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    }
  },
}, {
  timestamps: false,
  underscored: true,
  hooks: {
    beforeCreate: (company) => {
      // const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(Date.now());
      company.created_at = istDate;
      company.updated_at = istDate;
    },
    beforeUpdate: (company) => {
      // const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(Date.now());
      company.updated_at = istDate;
    },
    afterUpdate: async (company, options) => {
      const { updateUserCompanyName } = require('../helpers/updateUserCompanyName');
      await updateUserCompanyName(company);
    }
  }
});


module.exports = Company;
