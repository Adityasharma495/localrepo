const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants');
const { constants } = require('../utils/common');
const USER_MODEL_NAME = constants.MODEL.USERS;
const AGENT_MODEL_NAME = constants.MODEL.AGENTS;

const AgentsGroupSchema = new mongoose.Schema({
    member_schedule_id:{
        type:String,
        require:false,
    },
    group_name: {
        type: String,
        required: true,
        trim: true,
    },
    agent_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: AGENT_MODEL_NAME,
            required: false,
        },
    ],
    time_schedule: [
        {
            week_days: [
                {
                    type: String,
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    required: true,
                }],
            time: {
                type: Boolean,
                default: false,
            },
        },
    ],
    // add_member_schedule: [
    //     {
    //         week_days:[
    //             {
    //             type: String,
    //             enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    //             required: true,
    //         }],   
    //         start_time: {
    //             type: String, 
    //             required: true,
    //         },
    //         end_time: {
    //             type: String, 
    //             required: true,
    //         },
    //     },
    // ],
    manager: {
        type: String,
        required: true,
        trim: true,
    },
    group_owner: {
        type: String,
        required: false,
        default: 'Not Assigned',
        trim: true,
    },
    member_count: {
        type: Number,
        default: 0,
    },
    strategy: {
        type: String,
        enum: ["ROUNDROBIN RINGING", "SEQUENTIAL RINGING", "RANDOM RINGING", "LEAST OCCUPIED RINGING", "LEAST IDLE RINGING"],
        default: 'ROUNDROBIN RINGING',
    },
    answered: {
        type: Number,
        default: 0,
    },
    missed: {
        type: Number,
        default: 0,
    },
    sticky: {
        type: Boolean,
        default: false,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false,
    timestamps: true,
});

// Pre-save middleware to set timestamps
AgentsGroupSchema.pre('save', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    if (this.isNew) {
        this.createdAt = istDate;
    }
    this.updatedAt = istDate;

    next();
});

// Pre-update middleware to update timestamps
AgentsGroupSchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updatedAt = istDate;

    next();
});



const agentGroupData = mongoose.model(MODEL.AGENTS_GROUP, AgentsGroupSchema);

module.exports = agentGroupData;
