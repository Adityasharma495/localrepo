const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const OPERATOR_STATUS = constants.OPERATOR_STATUS;
const OPERATOR_MODEL_NAME = constants.MODEL.OPERATORS;
const USER_MODEL_NAME = constants.MODEL.USERS;

const OperatorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Number,
        enum: OPERATOR_STATUS,
        default: OPERATOR_STATUS.ACTIVE
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }

}, {
    versionKey: false,
    timestamps: true
});

// Pre-save middleware to convert timestamps to IST
OperatorSchema.pre('save', function (next) {
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
OperatorSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updatedAt = istDate;

    next();
});

const operatorSchema = mongoose.model(OPERATOR_MODEL_NAME, OperatorSchema);
module.exports = operatorSchema;