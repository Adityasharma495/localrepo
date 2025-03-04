const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const DATA_CENTER_TYPE = constants.DATA_CENTER_TYPE;
const { MODEL } = require('../utils/common/constants')

const validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const dataCenterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: { unique: false }
    },
    type: {
        type: Number,
        enum: DATA_CENTER_TYPE,
        required: true
    },
    domestic_details: {
        default: null,
        type: {
            state: {
                type: {
                    code: {
                        type : String,
                        required: true,
                    },
                    name: {
                        type : String,
                        required: true,
                    }
                },
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
        }
    },
    overseas_details: {
        default: null,
        type: {
            country: {
                type: {
                    code: {
                        type : String,
                        required: true,
                    },
                    name: {
                        type : String,
                        required: true,
                    }
                },
                required: true,
            },
            state: {
                type: {
                    code: {
                        type : String,
                        required: true,
                    },
                    name: {
                        type : String,
                        required: true,
                    }
                },
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
        }
    },
    contact_person: {
        type: String,
        required: true,
        trim: true
    },
    contact_email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    contact_number: {
        type: Number,
        required: true,
    },
    data_centre_company: {
        type: String,
        required: true
    },
    data_centre_address: {
        type: String,
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

// Middleware to update the 'updated_at' field whenever the document is deleted
dataCenterSchema.pre('updateMany', function(next) {
    this._update.updated_at = new Date();
    next();
});

    // Pre-save middleware to convert timestamps to IST
    dataCenterSchema.pre('save', function (next) {
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
    dataCenterSchema.pre('findOneAndUpdate', function (next) {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
        const istDate = new Date(now.getTime() + istOffset);

        this._update.updated_at = istDate;

        next();
    });


const dataCenter = mongoose.model(MODEL.DATACENTER, dataCenterSchema, MODEL.DATACENTER);

module.exports = dataCenter;
