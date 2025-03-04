const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')
const { constants } = require('../utils/common');
const bcrypt = require('bcrypt');
const USER_MODEL_NAME = constants.MODEL.USERS;

// Helper function for IST conversion
function convertToIST(date) {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
    return new Date(date.getTime() + istOffset);
}

// Helper function to hash the password
function hookHashPassword(user) {
    const SALT = bcrypt.genSaltSync(9);
    const encryptedPassword = bcrypt.hashSync(user.password.trim(), SALT);
    user.password = encryptedPassword;
}

const ExtentionSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    extention: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
      },
    isAllocated: {
        type: Number,
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
    timestamps: true
});

// Pre-save middleware for timestamps and hashing password
ExtentionSchema.pre('save', async function (next) {
    const now = new Date();

    // Convert timestamps to IST
    const istDate = convertToIST(now);
    if (this.isNew) {
        this.created_at = istDate; 
    }
    this.updated_at = istDate;

    // Hash password if the document is new or the password is modified
    if (this.isNew || this.isModified('password')) {
        hookHashPassword(this);
    }

    next();
});

// Pre-update middleware for timestamps and hashing password
ExtentionSchema.pre('findOneAndUpdate', async function (next) {
    const now = new Date();

    // Convert updated_at to IST
    const istDate = convertToIST(now);
    this._update.updated_at = istDate;

    // Hash password if it's being updated
    if (this._update.password) {
        const updateDoc = this._update;
        hookHashPassword(updateDoc);
    }

    next();
});

const extentionData = mongoose.model(MODEL.EXTENTION, ExtentionSchema, MODEL.EXTENTION);

module.exports = extentionData;