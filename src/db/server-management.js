const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const DATA_CENTER_TYPE = constants.DATA_CENTER_TYPE;
const { MODEL } = require('../utils/common/constants')
const USER_MODEL_NAME = constants.MODEL.USERS;

const serverManagementSchema = new mongoose.Schema({
        data_center: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'data_center',
            required: true
        },
        type: {
            type: Number,
            enum: DATA_CENTER_TYPE,
            required: true
        },
        server_ip: {
            type: String,
            required: true
        },
        server_name: {
            type: String,
            required: true
        },
        os: {
            type: String,
            required: true
        },
        cpu_cores: {
            type: Number,
            required: true
        },
        ram: {
            type: Number,
            required: true
        },
        hard_disk: {
            type: Number,
            required: true
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
serverManagementSchema.pre('save', function (next) {
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
serverManagementSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
});

// Middleware to update the 'updated_at' field whenever the document is deleted
serverManagementSchema.pre('updateMany', function(next) {
    this._update.updated_at = new Date();
    next();
});


const serverManagement = mongoose.model(MODEL.SERVERMANAGEMENT, serverManagementSchema, MODEL.SERVERMANAGEMENT);

module.exports = serverManagement;