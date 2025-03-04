const mongoose = require('mongoose');
const { constants} = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const ACL_SETTINGS_MODEL_NAME = constants.MODEL.ACL_SETTINGS;

  const AclSettingsSchema = new mongoose.Schema({
      acl_name: {
        type: String,
        required: true,
        trim: true,
        unique: true
      },
      module_operations: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
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

  // Pre-save middleware to convert timestamps to IST
  AclSettingsSchema.pre('save', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    // Set created_at and updatedAt fields to IST
    if (this.isNew) {
        this.created_at = istDate;
    }
    this.updated_at = istDate;

    next();
  });

  // Pre-update middleware to convert updatedAt to IST
  AclSettingsSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
  });

  const aclSettingsSchema = mongoose.model(ACL_SETTINGS_MODEL_NAME, AclSettingsSchema, ACL_SETTINGS_MODEL_NAME);

  module.exports = aclSettingsSchema;