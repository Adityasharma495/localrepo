const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants');
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const EXTENTION_MODEL_NAME = constants.MODEL.EXTENTION;
const ACCESS_CONTROL = constants.ACCESS_CONTROL;
const AGENT_TYPE = constants.AGENT_TYPE;
const AGENT_LOGIN_STATUS = constants.AGENT_LOGIN_STATUS;

const AgentsSchema = new mongoose.Schema({
    agent_name: {
        type: String,
        required: true,
        trim: true
    },
    agent_number: {
        type: Number,
        required: true
    },
    extention: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: EXTENTION_MODEL_NAME, 
    }],
    isAllocated: {
        type: Number,
        default: 0 
    },
    is_deleted: {
        type: Boolean,
        default: false 
    },
    access: {
        type: String,
        enum: [ACCESS_CONTROL.ADMIN, ACCESS_CONTROL.REGULAR, ACCESS_CONTROL.GROUP_OWNER],
        required: true,
    },
    type: {
        type: String,
        enum: [AGENT_TYPE.NORMAL, AGENT_TYPE.BROWSER_PHONE, AGENT_TYPE.SOFT_PHONE],
        required: true,
    },
    login_status: {
        type: String,
        default: AGENT_LOGIN_STATUS.INACTIVE,
    },
    email_id: {
        type: String,
        required: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
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
    },

    // ✅ Time Schedule Section
    time_schedule: {
        start_time: {
            type: String,
            default: "12:00:00 AM",
            match: [/^(0[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9]\s?(AM|PM)$/, 'Please use a valid time format (HH:MM:SS AM/PM)']
        },
        end_time: {
            type: String,
            default: "11:59:59 PM",
            match: [/^(0[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9]\s?(AM|PM)$/, 'Please use a valid time format (HH:MM:SS AM/PM)']
        },
        week_days: {
            type: [String],
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }
    }
}, {
    versionKey: false,
    // timestamps: true
});

// Pre-save middleware to convert timestamps to IST
AgentsSchema.pre('save', function (next) {
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
AgentsSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
});

const agentData = mongoose.model(MODEL.AGENTS, AgentsSchema);

module.exports = agentData;
