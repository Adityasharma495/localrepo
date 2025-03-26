const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { constants } = require('../utils/common');

const OPERATOR_STATUS = constants.OPERATOR_STATUS;

const Operator = sequelize.define(
  'operators',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      trim: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: OPERATOR_STATUS.ACTIVE,
      validate: {
        isIn: [[OPERATOR_STATUS.ACTIVE, OPERATOR_STATUS.INACTIVE]],
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users_new',
        key: 'id',
      },
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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

// Optional: Define association (if needed in your app)
Operator.associate = (models) => {
  Operator.belongsTo(models.users, { foreignKey: 'created_by', as: 'creator' });
};

module.exports = Operator;
