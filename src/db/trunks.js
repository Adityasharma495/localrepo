const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const AUTH_TYPES = constants.AUTH_TYPES;
const TRUNKS_STATUS = constants.TRUNKS_STATUS;
const TRUNKS_MODEL_NAME = constants.MODEL.TRUNKS;
const CODEC_MODEL = constants.MODEL.CODEC;
const USER_MODEL_NAME = constants.MODEL.USERS;
const OPERATOR_TYPES = constants.OPERATOR_TYPES;
const OPERATOR_MODEL = constants.MODEL.OPERATORS;
const SERVER_MODEL = constants.MODEL.SERVERMANAGEMENT;


const TrunksSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
        trim: true
    },
    auth_type: {
        type: String,
        required: true,
        enum: AUTH_TYPES
    },
    domain: {
        type: String,
        required: true,
        trim: true
    },
    port: {
        type: Number,
        required: true,
        trim: true
    },
    pilot_number: {
        type: String,
        required: true,
        trim: true
    },
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: OPERATOR_MODEL
    },
    channels: {
        type: Number,
        required: true,
        trim: true
    },
    cps: {
        type: Number,
        required: true,
        trim: true
    },
    status: {
        type: Number,
        enum: TRUNKS_STATUS,
        default: TRUNKS_STATUS.ACTIVE
    },
    codec: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CODEC_MODEL
    },
    auth_type_identify_by: {
        type: String,
        default: null
    },
    auth_type_registration: {
        default: null,
        type: {
            username: {
                type: String,
                required: true,
            },
            password: {
                type: String,
                required: true,
                trim: true,
            },
            server_url: {
                type: String,
                required: true,
            },
            client_url: {
                type: String,
                required: true,
            },
        }
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: SERVER_MODEL,
        required: true
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

const trunksSchema = mongoose.model(TRUNKS_MODEL_NAME, TrunksSchema);
module.exports = trunksSchema;