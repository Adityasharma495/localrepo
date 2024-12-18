const mongoose = require('mongoose');

const { constants} = require('../utils/common');

const USER_MODEL_NAME = constants.MODEL.USERS;
const USER_JOURNEY_NAME = constants.MODEL.USER_JOURNEY;

const UserJourneySchema = new mongoose.Schema({
      module_name: {
        type: String,
        required: true,
        trim: true,
      },
      action: {
        type: String,
        required: true
      },
      createdBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        default: null 
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      is_deleted: {
          type: Boolean,
          default: false
      }
  });

  // Pre-save middleware to convert timestamps to IST
  UserJourneySchema.pre('save', function (next) {
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
UserJourneySchema.pre('findOneAndUpdate', function (next) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
  const istDate = new Date(now.getTime() + istOffset);

  this._update.updatedAt = istDate;

  next();
});

  
  const userJourneySchema = mongoose.model(USER_JOURNEY_NAME, UserJourneySchema);

  module.exports = userJourneySchema;