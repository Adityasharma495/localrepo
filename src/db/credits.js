const mongoose = require('mongoose');
const { constants} = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const CREDITS = constants.MODEL.CREDITS;

  const CreditsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: USER_MODEL_NAME
    },
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: USER_MODEL_NAME
    },
    to_user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: USER_MODEL_NAME
    },
    action_user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: USER_MODEL_NAME
    },
    credits: {
        type: mongoose.Schema.Types.Decimal128,
        min: 0,
        default: 0
    },
    credits_rupees: {
        type: mongoose.Schema.Types.Decimal128,
        min: 0,
        default: 0
    },
    action: {
        type: String,
        required: true,
        enum: ['addition', 'deduction','inbound_deduction']
    },
    req_date: {
        type: Date,
        default: Date.now
    },
    balance: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0,
        min: 0
    },
    username: {
        type: String,
        default: null,
        trim: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
  },{
    versionKey: false,
    // timestamps: true
  });

  // Pre-save middleware to convert timestamps to IST
  CreditsSchema.pre('save', function (next) {
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
  CreditsSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
  });

  const creditsSchema = mongoose.model(CREDITS, CreditsSchema, CREDITS);

  module.exports = creditsSchema;