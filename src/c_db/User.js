const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ServerConfig } = require('../config');
const {Authentication} = require('../utils/common');
const AclSettings = require("./acl-settings")
const Company = require("./companies")

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue:0,
      allowNull: false,
    },
    flow_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    companies: {
      type: DataTypes.JSONB,  
      allowNull: true,
      defaultValue: null
    },
    acl_settings_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    credits_available: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
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
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);



// Hash password before saving
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(9);
  user.password = await bcrypt.hash(user.password, salt);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(9);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Compare passwords
User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate JWT Token
User.prototype.createToken = function () {
  try {
    const userData = { id: this.id, username: this.username, role: this.role };
    console.log("USER DATA", userData);
    return jwt.sign(userData, ServerConfig.JWT_SECRET, { expiresIn: ServerConfig.JWT_EXPIRY });
  } catch (error) {
    console.error("JWT Token Generation Failed:", error);
    throw new Error("Token generation failed");
  }
};


User.prototype.generateUserData = async function (tokenGenerate = false) {
  try {
    const user = await User.findByPk(this.id, {
      attributes: { exclude: ['password'] }, // Exclude password for security reasons
      // Here, you should include any related entities, like ACL settings or company details
      include: [
        {
          model: AclSettings,
          as: 'acl_settings',
          attributes: ['id', 'acl_name', 'module_operations'],
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userData = user.toJSON();

    if (userData.companies && userData.companies._id) {
      const companyDetails = await Company.findByPk(userData.companies._id);


      if (companyDetails) {
        userData.companies = {
          id: companyDetails.id,
          name: companyDetails.name,
          phone: companyDetails.phone,
          address: companyDetails.address,
          pincode: companyDetails.pincode,
        };
      }

    }

    if (tokenGenerate) {
      userData.token = await this.createToken();
    }

    // Assume getUserAccessRoles is a method that you define to get role access based on the user's role
    userData.roles_access = Authentication.getUserAccessRoles(this.role);

    return userData;
  } catch (error) {
    console.error('Error generating user data:', error);
    throw error;
  }
};



module.exports = User;
