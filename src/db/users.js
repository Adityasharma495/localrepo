const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { ServerConfig } = require('../config');
const { constants, Authentication } = require('../utils/common');

const USERS_STATUS = constants.USERS_STATUS_KEY_VALUES;
const USERS_ROLE = constants.USERS_ROLE;

const USER_MODEL_NAME = constants.MODEL.USERS;
const COMPANY_MODEL_NAME = constants.MODEL.COMPANIES;
const ACL_SETTINGS_MODEL = constants.MODEL.ACL_SETTINGS;
const SUB_USER_LICENCE_MODEL = constants.MODEL.SUB_USER_LICENCE;

  const validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
  };

  const UserSchema = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
      },
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
      },
      password: {
        type: String,
        required: true,
        trim: true
      },
      actual_password: {
        type: String,
        trim: true
      },
      role: {
        type: String,
        required: true,
        enum: USERS_ROLE
      },
      status: {
        type: Number,
        required: true,
        enum: USERS_STATUS,
        default: USERS_STATUS.ACTIVE
      },
      companies: {
        name: String,
        _id: {type: mongoose.Schema.Types.ObjectId, ref: COMPANY_MODEL_NAME}
      },
      acl_settings: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ACL_SETTINGS_MODEL,
        default: null 
      },
      prefix: {
        type: Number,
        required: false,
        default: null
      },
      sub_user_licence_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: SUB_USER_LICENCE_MODEL,
        default: null 
      },
      is_deleted: {
        type: Boolean,
        default: false
      },
      created_by: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        default: null 
      },
      flow_type: {
        type: Number,
        default: null
      },
      credits_available:{
        type: Number,
        default: 0,
      },
      created_at: {
          type: Date,
          default: Date.now
      },
      updated_at: {
          type: Date,
          default: Date.now
      }
  },{
    versionKey: false,
    // timestamps: true
  });

  UserSchema.pre('save', async function save(next) {
    if (this.isNew || this.isModified('password')) {
      this.actual_password = this.password;
      hookHashPassword(this);
    }
    next();
  });

  UserSchema.pre('findOneAndUpdate', async function save(next) {
    if(this._update.password) {
      // this._update.actual_password = this._update.password;
      hookHashPassword(this._update);
    };
    next();
  });

  function hookHashPassword(user){
    const SALT = bcrypt.genSaltSync(9);
    const encryptedPassword = bcrypt.hashSync(user.password.trim(), SALT);
    user.password = encryptedPassword;
  }
  
  UserSchema.methods.comparePassword = async function compare(password) {
    return bcrypt.compareSync(password, this.password);
  }

  UserSchema.methods.isActive = function activeStatus(){
    return this.status == USERS_STATUS.ACTIVE;
  }

  UserSchema.methods.isDeleted = function isDelete(){
    return this.is_deleted == true;
  }

  UserSchema.methods.isValidLogin = function isDelete(){
    return this.status == USERS_STATUS.ACTIVE && this.is_deleted == false;
  }

  UserSchema.methods.createToken = async function createJWT(){

    try {
    
      const userData = { id: this._id, username: this.username, role: this.role, companies: this.companies };
      const token = await jwt.sign(userData, ServerConfig.JWT_SECRET, {expiresIn: ServerConfig.JWT_EXPIRY});
      return token;
    
    } catch (error) {
    
      throw error;
    
    }

  }

  UserSchema.methods.generateUserData = async function userData(token_generate = false){

    try {
      // Find the user by id and populate the module field
      const user = await this.model(USER_MODEL_NAME)
      .findById(this._id)
      .populate('acl_settings', '_id acl_name module_operations')
      .populate('sub_user_licence_id')
      .exec();
      if (!user) throw new Error('User not found');
      const userData = user.toObject();
      // const userData = this.toObject();
      if(token_generate){
        const token =  await this.createToken();
        userData['token'] = token;
      }
      delete userData['password'];
      userData['roles_access'] = Authentication.getUserAccessRoles(this.role);

      return userData;

    } catch (error) {

      throw error;
    
    }

  }

  /**
   * Once a company is created, embed the company name to its corresponding admin user's doc
   * {
   *  ...
   *  companies: {'company name', _id}
   * }
   * @param {string} comp_name 
   */
  UserSchema.methods.addCompany = async function(comp_id, comp_name){

    try {
      
      this.companies = { _id: comp_id, name: comp_name };
      this.save();

    } catch (error) {
      
      throw error;

    }

  }

    // Pre-save middleware to convert timestamps to IST
    UserSchema.pre('save', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    // Set created_at and updated_at fields to IST
    if (this.isNew) {
        this.created_at = istDate;
    }
    this.updated_at = istDate;

    next();
  });

  // Pre-update middleware to convert updated_at to IST
  UserSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
  });

  const userSchema = mongoose.model(USER_MODEL_NAME, UserSchema);

  module.exports = userSchema;