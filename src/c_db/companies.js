const { DataTypes } = require('sequelize');
const { constants } = require('../utils/common');
const sequelize = require("../config/sequelize");
const USER_MODEL_NAME = constants.MODEL.USERS;
const COMPANY_MODEL_NAME = constants.MODEL.COMPANIES;

const Company = sequelize.define(COMPANY_MODEL_NAME, {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
    type: DataTypes.ENUM(...Object.values(constants.COMPANY_TYPES)),
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
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
  }
}, {
  timestamps: false,
  underscored: true,
  hooks: {
    beforeCreate: (company) => {
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(Date.now() + istOffset);
      company.created_at = istDate;
      company.updated_at = istDate;
    },
    beforeUpdate: (company) => {
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(Date.now() + istOffset);
      company.updated_at = istDate;
    },
    afterUpdate: async (company, options) => {
      const { updateUserCompanyName } = require('../helpers/updateUserCompanyName');
      await updateUserCompanyName(company);
    }
  }
});


module.exports = Company;
