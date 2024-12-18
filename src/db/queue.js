const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const EXTENTION = constants.MODEL.EXTENTION;


// Helper function for IST conversion
function convertToIST(date) {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
    return new Date(date.getTime() + istOffset);
}

const QueueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
      },
      extention: {
        type: mongoose.Schema.Types.ObjectId,
        ref: EXTENTION,
        required: true,    
      },
      max_wait_time: {
        type: Number,
        required: true,
        min: 0,
      },
      open_wrapup: {
        type: Number,
        required: true,
      },
      default_wrapup_tag: {
        type: Number,
        default: null,
      },
      wrapper_session_timeout: {
        type: Number,
        default: null,
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

// Pre-save middleware for timestamps and hashing password
QueueSchema.pre('save', async function (next) {
    const now = new Date();

    // Convert timestamps to IST
    const istDate = convertToIST(now);
    if (this.isNew) {
        this.createdAt = istDate; 
    }
    this.updatedAt = istDate;

    next();
});

// Pre-update middleware for timestamps and hashing password
QueueSchema.pre('findOneAndUpdate', async function (next) {
    const now = new Date();

    // Convert updatedAt to IST
    const istDate = convertToIST(now);
    this._update.updatedAt = istDate;

    next();
});

const queueData = mongoose.model(MODEL.QUEUE, QueueSchema);

module.exports = queueData;