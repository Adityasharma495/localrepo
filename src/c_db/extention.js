const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcrypt');
const User = require('./User'); // ✅ Import User model
const { MODEL } = require('../utils/common/constants');

// ✅ Helper Function: Convert UTC to IST
function convertToIST(date) {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
  return new Date(date.getTime() + istOffset);
}

// ✅ Helper Function: Hash Password
async function hashPassword(user) {
  const SALT = await bcrypt.genSalt(9);
  user.password = await bcrypt.hash(user.password.trim(), SALT);
}

// ✅ Define Sequelize Model
const Extension = sequelize.define(
  MODEL.EXTENSION, // Table name from constants
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    extension: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    is_allocated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    versionKey: false,
  }
);

// ✅ Hooks for Password Hashing & Timestamp Conversion
Extension.beforeCreate(async (extension) => {
  // Convert timestamps to IST
  extension.created_at = convertToIST(new Date());
  extension.updated_at = convertToIST(new Date());

  // Hash password
  if (extension.password) {
    await hashPassword(extension);
  }
});

Extension.beforeUpdate(async (extension) => {
  // Convert updated timestamp to IST
  extension.updated_at = convertToIST(new Date());

  // Hash password if changed
  if (extension.changed('password')) {
    await hashPassword(extension);
  }
});

// ✅ Define Relationship
Extension.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = Extension;
