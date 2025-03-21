const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid')
const { constants } = require('../utils/common');
const MEMEBER_SCHEDULES_MODEL_NAME = constants.MODEL.MEMEBER_SCHEDULES;
const USER_MODEL_NAME = constants.MODEL.USERS;

const FlowSchema = new mongoose.Schema(
  {
    call_center_id: {
      type: String,
      required: true,
      trim: true,
    },
    flow_name: {
      type: String,
      required: true,
      trim: true,
    },
    flow_id: {
      type: String,
      required:true,
      default: uuidv4,
    },
    node_id: {
      type: Number,
      required: true,
    },
    schedule_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MEMEBER_SCHEDULES_MODEL_NAME,
      default: null
    },
    flow_json: {
      type: Object, 
      required: true,
    },
    status: {
      type: Number, 
      required: true,
      default: 1,
    },
    flow_render: {
      type: Object, 
      required: true,
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
  },
  {
    versionKey: false, 
    // timestamps: true, 
  }
);


  // Pre-save middleware to convert timestamps to IST
  FlowSchema.pre('insertMany', function (next, docs) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    // Loop through each document and set IST dates
    docs.forEach(doc => {
        doc.created_at = istDate;
        doc.updated_at = istDate;
    });

    next();
  });

const FlowControlSchema = new mongoose.Schema(
  {
   
    call_center_id: {
      type: String,
      required: true,
      trim: true,
    },
    flow_name: {
      type: String,
      required: true,
      trim: true,
    },
    flow_id: {
      type: String,
      required:true,
      default: uuidv4,
    },
    node_id: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    next_node: {
      type: Number, 
    //   required: true,
    },
    status: {
      type: Number, 
      required: true,
      default: 1,
    },
  },
  {
    versionKey: false, 
    // timestamps: true, 
  }
);


const FlowModel = mongoose.model('flows', FlowSchema);
const FlowControlModel = mongoose.model('flow_controls', FlowControlSchema);

module.exports = {
  FlowModel,
  FlowControlModel,
};
