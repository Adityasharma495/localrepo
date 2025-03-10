const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const AGENT_MODEL_NAME = constants.MODEL.AGENTS; 
const EXTENSION_MODEL_NAME = constants.MODEL.EXTENSION

const AgentsGroupMappingSchema = new mongoose.Schema({
    agent_group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AGENT_MODEL_NAME, 
        required: true
    },
    extension_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: EXTENSION_MODEL_NAME, 
        required: false
    },
    is_deleted: {
        type: Boolean,
        default: false 
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
    }
}, {
    versionKey: false,
    // timestamps: true
});

// Pre-save middleware to convert timestamps to IST
AgentsGroupMappingSchema.pre('save', function (next) {
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
AgentsGroupMappingSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
});

const agentGroupMappingData = mongoose.model(MODEL.AGENTS_GROUP_MAPPING, AgentsGroupMappingSchema, MODEL.AGENTS_GROUP_MAPPING);

module.exports = agentGroupMappingData;
