const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const AclSettings = sequelize.define(
  'aclsettings',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    acl_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      trim: true,
    },
    module_operations: {
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
    tableName: 'aclsettings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

AclSettings.beforeUpdate((instance) => {
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  instance.updated_at = istNow;
});

// Optionally: Define associations if needed later
AclSettings.associate = (models) => {
  AclSettings.belongsTo(models.users, {
    foreignKey: 'created_by',
    as: 'creator',
  });
};

module.exports = AclSettings;
