const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const CALLS_MODEL_NAME = constants.MODEL.CALLS;
const USER_MODEL_NAME = constants.MODEL.USERS;

const CallSchema = new mongoose.Schema({
    did: {
        type: String,
        default: null
    },
    caller_number: {
        type: Number,
        required: true
    },
    answer_status: {
        type: String,
        default: null
    },
    end_time: {
        type: Date,
        default: null
    },
    patch_duration: {
        type: Number,
        default: null
    },
    billing_duration: {
        type: Number,
        default: null
    },
    dtmf: {
        type: String,
        default: null
    },
    dnd: {
        type: Boolean,
        default: null
    },
    call_sid: {
        type: String,
        default: null
    },
    start_time: {
        type: Date,
        default: null
    },
    pulses: {
        type: Number,
        default: null
    },
    hangup_cause: {
        type: String,
        default: null
    },
    trunk: {
        type: String,
        default: null
    },
    callee_number: {
        type: String,
        default: null
    },
    bridge_time: {
        type: Date,
        default: null
    },
    bridge_ring_duration: {
        type: Number,
        default: null
    },
    recording_file: {
        type: String,
        default: null
    },
    recording_uploaded: {
        type: Boolean,
        required: true,
        default: false
    },
    caller_profile: {
        type: String,
        default: null
    },
    category: {
        type: String,
        default: null
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
}, {
    versionKey: false,
    // timestamps: true
});

 // Pre-save middleware to convert timestamps to IST
 CallSchema.pre('save', function (next) {
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
  CallSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
  });

const callsSchema = mongoose.model(CALLS_MODEL_NAME, CallSchema);
module.exports = callsSchema;