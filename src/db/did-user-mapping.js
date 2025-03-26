const mongoose = require('mongoose');
const { constants} = require('../utils/common');
const DID_USER_MAPPING_MODEL_NAME = constants.MODEL.DID_USER_MAPPING;
const NUMBER_MODEL_NAME = constants.MODEL.NUMBERS;

const USER_MODEL_NAME = constants.MODEL.USERS;


  const DIDUserMappingSchema = new mongoose.Schema({
      DID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: NUMBER_MODEL_NAME,
        default: null 
      },
      level: {
        type: Number,
        default: 0
      },
      allocated_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        default: null 
      },
      parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null 
      },
      active: {
        type: Boolean,
        default: true 
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
  DIDUserMappingSchema.pre('save', function (next) {
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
  DIDUserMappingSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
  });

  const didUserMappingSchema = mongoose.model(DID_USER_MAPPING_MODEL_NAME, DIDUserMappingSchema, DID_USER_MAPPING_MODEL_NAME);

  module.exports = didUserMappingSchema;