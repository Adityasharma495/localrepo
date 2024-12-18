const { MODEL } = require('../utils/common/constants')
const mongoose = require('mongoose');

const USER_MODEL_NAME = MODEL.USERS;
const COMPANY_MODEL_NAME = MODEL.COMPANIES;
const COUNTRY_CODE_MODEL_NAME = MODEL.COUNTRY_CODE;
const TIMEZONE_MODEL_NAME = MODEL.TIMEZONES;

const CallCentreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: { unique: true },
    trim: true, lowercase: true
  },
  domain: {
    type: String,
    required: true,
    index: { unique: true },
    trim: true, lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: COMPANY_MODEL_NAME
  },
  country_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: COUNTRY_CODE_MODEL_NAME
  },
  timezone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: TIMEZONE_MODEL_NAME
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: USER_MODEL_NAME,
    default: null
  }
}, {
  versionKey: false,
  timestamps: true
});

  // Pre-save middleware to convert timestamps to IST
  CallCentreSchema.pre('save', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    // Set createdAt and updatedAt fields to IST
    if (this.isNew) {
        this.createdAt = istDate;
    }
    this.updatedAt = istDate;

    next();
  });

  // Pre-update middleware to convert updatedAt to IST
  CallCentreSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updatedAt = istDate;

    next();
  });


const callCentreModel = mongoose.model('callCentres', CallCentreSchema);

module.exports = callCentreModel;