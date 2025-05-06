const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ServerConfig } = require('../config');
const {Authentication} = require('../utils/common');
const AclSettings = require("./acl-settings")
const SubUserLicence = require("./sub-user-licence")
const Company = require("./companies")
const CallCenter =  require('./call-centres')

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.BIGINT,
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
    actual_password: {
      type: DataTypes.STRING,
      allowNull: true,
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
      defaultValue:1,
      allowNull: false,
    },
    flow_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    prefix: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Company,
        key: 'id'
      }
    },
    callcenter_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: CallCenter,
        key: 'id'
      }
    },
    acl_settings_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    sub_user_licence_id: {
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


User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(9);
  user.actual_password = user.password; 
  user.password = await bcrypt.hash(user.password, salt);
});


User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.actual_password = user.password;
    const salt = await bcrypt.genSalt(9);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

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
        },
        {
          model: SubUserLicence,
          as: 'sub_user_licence',
        },
        {
          model: Company,
          as: 'company',
        },
        {
          model: CallCenter,
          as: 'callcenter',
        },
        {
          model: User,
          as: 'createdByUser',
          include: [
            {
              model: User,
              as: 'createdByUser',
            }
          ]
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

    userData.roles_access = Authentication.getUserAccessRoles(this.role);

    return userData;
  } catch (error) {
    console.error('Error generating user data:', error);
    throw error;
  }
};



module.exports = User;
