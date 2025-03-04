const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;

const ModuleSchema = new mongoose.Schema({
    module_name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Number,
        required: true,
        default: 1
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
    timestamps: true
});

// Pre-save middleware to convert timestamps to IST
ModuleSchema.pre('save', function (next) {
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
ModuleSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
});

const moduleData = mongoose.model(MODEL.MODULE, ModuleSchema);

module.exports = moduleData;