const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;

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
        required: false,
        default: 0
    },
    availeble_licence: {
        type: Number,
        required: false,
        default: 0
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
LicenceSchema.pre('save', function (next) {
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
LicenceSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
});

const licenceData = mongoose.model(MODEL.LICENCE, LicenceSchema, MODEL.LICENCE);

module.exports = licenceData;
