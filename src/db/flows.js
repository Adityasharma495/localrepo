const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid')
const { constants } = require('../utils/common');
const MEMEBER_SCHEDULES_MODEL_NAME = constants.MODEL.MEMEBER_SCHEDULES;

const FlowSchema = new mongoose.Schema(
  {
    callcenterId: {
      type: String,
      required: true,
      trim: true,
    },
    flowName: {
      type: String,
      required: true,
      trim: true,
    },
    flowId: {
      type: String,
      required:true,
      default: uuidv4,
    },
    nodeId: {
      type: Number,
      required: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MEMEBER_SCHEDULES_MODEL_NAME,
      default: null
    },
    flowJson: {
      type: Object, 
      required: true,
    },
    status: {
      type: Number, 
      required: true,
      default: 1,
    },
    flowRender: {
      type: Object, 
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
   }
  },
  {
    versionKey: false, 
    timestamps: true, 
  }
);


  // Pre-save middleware to convert timestamps to IST
  FlowSchema.pre('insertMany', function (next, docs) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    // Loop through each document and set IST dates
    docs.forEach(doc => {
        doc.createdAt = istDate;
        doc.updatedAt = istDate;
    });

    next();
  });

const FlowControlSchema = new mongoose.Schema(
  {
   
    callcenterId: {
      type: String,
      required: true,
      trim: true,
    },
    flowName: {
      type: String,
      required: true,
      trim: true,
    },
    flowId: {
      type: String,
      required:true,
      default: uuidv4,
    },
    nodeId: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    nextNode: {
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
    timestamps: true, 
  }
);


const FlowModel = mongoose.model('flows', FlowSchema);
const FlowControlModel = mongoose.model('flowControls', FlowControlSchema);

module.exports = {
  FlowModel,
  FlowControlModel,
};
