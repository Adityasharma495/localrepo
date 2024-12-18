const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const AGENT_MODEL_NAME = constants.MODEL.AGENTS; 
const EXTENTION_MODEL_NAME = constants.MODEL.EXTENTION

const LicenceSchema = new mongoose.Schema({
    user_type: {
        type: String,
        required: true,
        trim: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME, 
        required: true
    },
    total_licence: {
        type: Number,
        required: true
    },
    availeble_licence: {
        type: Number,
        required: true,
        default: 0
    },
    is_deleted: {
        type: Boolean,
        default: false 
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
LicenceSchema.pre('save', function (next) {
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
LicenceSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updatedAt = istDate;

    next();
});

const licenceData = mongoose.model(MODEL.LICENCE, LicenceSchema);

module.exports = licenceData;
