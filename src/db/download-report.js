const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const { MODEL } = require('../utils/common/constants')
const USER_MODEL_NAME = constants.MODEL.USERS;

const downloadReportSchema = new mongoose.Schema({
        did: {
            type: String,
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: USER_MODEL_NAME,
            default: null 
        },
        requested_date: {
            type: Date,
            default: Date.now
        },
        status: {
            type: Number,
            required: true
        },
        updated_date: {
            type: Date,
            default: Date.now
        },
        report_type: {
            type: String,
            required: true
        },
        download_link: {
            type: String,
            default: null
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
    }, {
        versionKey: false,
    });

// Pre-save middleware to convert timestamps to IST
downloadReportSchema.pre('save', function (next) {
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
downloadReportSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
});

// Middleware to update the 'updated_at' field whenever the document is deleted
downloadReportSchema.pre('updateMany', function(next) {
    this._update.updated_at = new Date();
    next();
});


const downloadReport = mongoose.model(MODEL.DOWNLOAD_REPORTS, downloadReportSchema);

module.exports = downloadReport;