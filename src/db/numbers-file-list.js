const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;

const NumberFileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        default: null 
    },
    file_name: {
        type: String,
        required: true,
        trim: true
    },
    file_url: {
        type: String,
        required: true,
        trim: true
    },
    upload_date: { 
        type: Date,
        default: Date.now
    },
    is_deleted: {
        type: Boolean,
        default: false
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
NumberFileSchema.pre('save', function (next) {
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
NumberFileSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updatedAt = istDate;

    next();
});

const moduleData = mongoose.model(MODEL.NUMBER_FILES_LIST, NumberFileSchema);

module.exports = moduleData;