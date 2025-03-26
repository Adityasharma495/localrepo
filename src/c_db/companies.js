const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User');
const { constants } = require('../utils/common');

const COMPANY_TYPES = constants.COMPANY_TYPES;

const Company = sequelize.define(
  'companies',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('name', value.trim().toLowerCase());
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('phone', value.trim());
      },
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('pincode', value.trim());
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('address', value.trim());
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [COMPANY_TYPES],
      },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => {
        const now = new Date();
        return new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // IST offset
      },
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: () => {
        const now = new Date();
        return new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // IST offset
      },
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    versionKey: false,
  }
);

// ✅ Many-to-many: companies <-> users
Company.belongsToMany(User, {
  through: 'company_users',
  as: 'users',
  foreignKey: 'company_id',
  otherKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Optional: If you want to easily access created_by user
Company.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = Company;
