const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const VOICE_PLAN_MODEL_NAME = constants.MODEL.VOICE_PLAN;

const VoicePlanSchema = new mongoose.Schema({
    plan_name: {
        type: String,
        required: true,
        trim: true,
    },
    plans:[ 
        {
          plan_type: {
            type: String,
            required: true,
            enum: ["INBOUND", "OUTBOUND", "MISSED"],
          },
          pulse_price: {
            type: Number,
            required: true
          },
          pulse_duration: {
            type: Number,
            required: true
          },
          price: {
            type: Number,
            required: true
          },
    }],
    plan_status: {
        type: Number,
        required: true,
        default: 1
    },
    req_date: {
        type: Date,
        default: Date.now
    },
    update_date: {
        type: Date,
        default: null
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        required: true
    },
    is_allocated: {
      type: Number,
      required: true,
      default: 0
    },
}, {
    versionKey: false
});

// Pre-save middleware to convert timestamps to IST
VoicePlanSchema.pre('save', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(now.getTime() + istOffset);

    if (this.isNew) {
        this.req_date = istDate;
    }
    this.updated_at = istDate;

    next();
  });

  // Pre-update middleware to convert updatedAt to IST
  VoicePlanSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
  });

const VoicePlan = mongoose.model(VOICE_PLAN_MODEL_NAME, VoicePlanSchema);

module.exports = VoicePlan;
