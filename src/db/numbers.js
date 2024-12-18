const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const COMPANIES_MODEL_NAME = constants.MODEL.COMPANIES;
const USER_MODEL_NAME = constants.MODEL.USERS;
const NUMBER_FILES_LIST = constants.MODEL.NUMBER_FILES_LIST;
const NUMBER_MODEL_NAME = constants.MODEL.NUMBERS;


const NumbersSchema = new mongoose.Schema({
    status: {
        type: Number,
        required: true
    },
    actual_number: {
        type: Number,
        required: true
    },
    routing_id: {
        type: String,
        default: null
    },
    routing_type: {
        type: String,
        default: null
    },
    routing_destination: {
        type: Number,
        default: null
    },
    country_code: {
        type: String,
        default: null
    },
    state_code: {
        type: String,
        default: null
    },
    category: {
        type: String,
        default: null
    },
    currency: {
        type: String,
        default: null
    },
    cost: {
        type: String,
        default: null
    },
    operator: {
        type: String,
        default: null
    },
    number_type: {
        type: String,
        default: null
    },
    uploaded_file_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: NUMBER_FILES_LIST,
        default: null
    },
    expiry_date: {
        type: Date,
        default: null
    },
    updated_status: {
        type: Number,
        default: null
    },
    allocated_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        default: null
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
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
    timestamps: true // Enable automatic timestamps
});

// Pre-save middleware to convert timestamps to IST
NumbersSchema.pre('save', function (next) {
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
NumbersSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updatedAt = istDate;

    next();
});

const numbersModel = mongoose.model(NUMBER_MODEL_NAME, NumbersSchema);

module.exports = { numbersModel };
