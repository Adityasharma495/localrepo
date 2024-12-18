const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const DATA_CENTER_TYPE = constants.DATA_CENTER_TYPE;
const { MODEL } = require('../utils/common/constants')
const USER_MODEL_NAME = constants.MODEL.USERS;

const serverManagementSchema = new mongoose.Schema({
        data_center: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'datacenter',
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
            type: String,
            required: true
        },
        ram: {
            type: String,
            required: true
        },
        hard_disk: {
            type: String,
            required: true
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
serverManagementSchema.pre('save', function (next) {
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
serverManagementSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updatedAt = istDate;

    next();
});

// Middleware to update the 'updatedAt' field whenever the document is deleted
serverManagementSchema.pre('updateMany', function(next) {
    this._update.updatedAt = new Date();
    next();
});


const serverManagement = mongoose.model(MODEL.SERVERMANAGEMENT, serverManagementSchema);

module.exports = serverManagement;