const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;

const NumberStatusSchema = new mongoose.Schema({
    status_code: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        required: true
    },
    expiry_date: { 
        type: Date,
        default: Date.now
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
    }
}, {
    versionKey: false,
    timestamps: true
});

    // Pre-save middleware to convert timestamps to IST
    NumberStatusSchema.pre('save', function (next) {
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
    NumberStatusSchema.pre('findOneAndUpdate', function (next) {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
        const istDate = new Date(now.getTime() + istOffset);

        this._update.updated_at = istDate;

        next();
    });

const moduleData = mongoose.model(MODEL.NUMBER_STATUS, NumberStatusSchema, MODEL.NUMBER_STATUS);

module.exports = moduleData;