const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const INCOMING_REPORTS_MODEL = constants.MODEL.INCOMING_REPORTS;

const CallRecordSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: constants.MODEL.USERS, 
    },
    call_sid: {
        type: String,
    },
    caller_number: {
        type: String,
    },
    callee_number: {
        type: String,
    },
    start_time: {
        type: Date,
        default: null
    },
    end_time: {
        type: Date,
        default: null
    },
    bridge_time: {
        type: Date,
        default: null
    },
    billing_duration: {
        type: Number,
    },
    patch_duration: {
        type: Number,
    },
    bridge_ring_duration: {
        type: Number,
    },
    answer_status: {
        type: String,
    },
    dtmf: {
        type: String,
        default: null
    },
    pulses: {
        type: Number,
        default: 0
    },
    dnd: {
        type: Boolean,
        default: false
    },
    hangup_cause: {
        type: String,
    },
    trunk: {
        type: String,
    },
    recording_file: {
        type: String,
        default: null
    },
    recording_uploaded: {
        type: Boolean,
        default: false
    },
    caller_profile: {
        type: String,
        default: null
    },
    category: {
        type: String,
    },
    status: {
        type: String,
    },
    agent_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: constants.MODEL.AGENTS, 
    },
    agent_number: {
        type: String,
    },
    agent_name: {
        type: String,
    },
    queue_name: {
        type: String,
    },
    queue_hold_time: {
        type: Number,
    },
    hold_last_start_time: {
        type: Number,
    },
    total_hold_duration: {
        type: Number,
    },
    report_time: {
        type: Date,
    }
},);

CallRecordSchema.pre('save', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(now.getTime() + istOffset);

    this.report_time = istDate;

    next();
});

CallRecordSchema.pre('save', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(now.getTime() + istOffset);

    this.start_time = istDate;

    next();
});

CallRecordSchema.pre('save', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(now.getTime() + istOffset);

    this.end_time = istDate;

    next();
});

const CallRecord = mongoose.model(INCOMING_REPORTS_MODEL, CallRecordSchema);

module.exports = CallRecord;