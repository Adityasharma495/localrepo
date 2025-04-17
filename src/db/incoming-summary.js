const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const INCOMING_SUMMARY_MODEL = constants.MODEL.INCOMING_SUMMARY;

const IncomingSummarySchema = new mongoose.Schema(
  {
    did: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: constants.MODEL.USERS },
    schedule_date: { type: Date, required: true },
    nos_processed: { type: Number, default: 0 },
    total_nos: { type: Number, default: 0 },
    dnd_count: { type: Number, default: 0 },
    pulses: { type: Number, default: 0 },
    connected_calls: { type: Number, default: 0 },
    dtmf_count: { type: Number, default: 0 },
    dtmf1_count: { type: Number, default: 0 },
    dtmf2_count: { type: Number, default: 0 },
    retry_count: { type: Number, default: 0 },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: constants.MODEL.USERS},
    parent_pulse_duration: { type: Number, default: 0 },
    s_parent_id: { type: mongoose.Schema.Types.ObjectId, ref: constants.MODEL.USERS},
    s_parent_pulse_duration: { type: Number, default: 0 },
    pulse_duration: { type: Number, default: 0 },
    auto_retry_count: { type: Number, default: 0 },
    sms_count: { type: Number, default: 0 },
    parent_pulses: { type: Number, default: 0 },
    s_parent_pulses: { type: Number, default: 0 },
    parent_refund: { type: Number, default: 0 },
    s_parent_refund: { type: Number, default: 0 },
    billing_duration: { type: Number, default: 0 },
    tts_count: { type: Number, default: 0 },
    webhook_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  {
    versionKey: false
  }
);

IncomingSummarySchema.pre('save', function (next) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; 
  const istDate = new Date(now.getTime() + istOffset);

  if (this.isNew) {
    this.created_at = istDate;
  }
  this.updated_at = istDate;
  next();
});

IncomingSummarySchema.pre('findOneAndUpdate', function (next) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; 
  const istDate = new Date(now.getTime() + istOffset);

  this._update.updated_at = istDate;
  next();
});

const IncomingSummaryModel = mongoose.model(INCOMING_SUMMARY_MODEL, IncomingSummarySchema, INCOMING_SUMMARY_MODEL);

module.exports = IncomingSummaryModel;
