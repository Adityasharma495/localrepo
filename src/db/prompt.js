const mongoose = require("mongoose");
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const PROMPT_MODEL_NAME = constants.MODEL.PROMPT;

const PromptSchema = new mongoose.Schema({
    prompt_name:{
        type:String,
        require:true,
    },
    prompt_url:{
        type:String,
        require:true,
    },
    prompt_duration:{
        type:Number,
        default:0,
        require:true,
    },
    prompt_category:{
        type:String,
        require:true,
    },
    prompt_status:{
        type:Number,
        default:0
    },
    approval_time:{
        type:Date,
        default:null,
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
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
}, {
    versionKey: false,
    // timestamps: true
})

// Pre-save middleware to convert timestamps to IST
PromptSchema.pre('save', function (next) {
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
PromptSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
});

const PromptModel = mongoose.model(PROMPT_MODEL_NAME, PromptSchema)
module.exports = PromptModel