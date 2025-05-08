const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { MODEL } = require('../utils/common/constants');

const SubUserLicence = sequelize.define(
  MODEL.SUB_USER_LICENCE,
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: MODEL.USERS,
        key: 'id',
      },
    },
    total_licence: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    available_licence: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: MODEL.USERS,
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true,
  }
);

// Hook to handle timestamps conversion to IST
const adjustIST = (instance) => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  instance.setDataValue('updated_at', istTime);
  if (instance.isNewRecord) {
    instance.setDataValue('created_at', istTime);
  }
};

SubUserLicence.beforeCreate((instance) => adjustIST(instance));
SubUserLicence.beforeUpdate((instance) => adjustIST(instance));

module.exports = SubUserLicence;
