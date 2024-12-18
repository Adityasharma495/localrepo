const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const EXTENTION_MODEL_NAME = constants.MODEL.EXTENTION
const ACCESS_CONTROL = constants.ACCESS_CONTROL
const AGENT_TYPE= constants.AGENT_TYPE
const AGENT_LOGIN_STATUS = constants.AGENT_LOGIN_STATUS

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
        // enum: [AGENT_LOGIN_STATUS.ACTIVE, AGENT_LOGIN_STATUS.INACTIVE],
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
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        default: null 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
    timestamps: true
});

// Pre-save middleware to convert timestamps to IST
AgentsSchema.pre('save', function (next) {
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
AgentsSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updatedAt = istDate;

    next();
});

const agentData = mongoose.model(MODEL.AGENTS, AgentsSchema);

module.exports = agentData;