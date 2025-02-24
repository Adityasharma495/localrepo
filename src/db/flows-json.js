const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const { MODEL } = require('../utils/common/constants')
const USER_MODEL_NAME = constants.MODEL.USERS;
const MEMEBER_SCHEDULES_MODEL_NAME = constants.MODEL.MEMEBER_SCHEDULES;
const PROMPTS_MODEL_NAME = constants.MODEL.PROMPT;


const FlowJsonSchema = new mongoose.Schema(
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
    },
    nodesData: {
      type: Object, 
      required: true,
    },
    edgesData: {
      type: Object, 
      required: true,
    },
    type: {
      type: Number, 
      required: true,
    },
    status: {
      type: Number, 
      required: true,
      default: 0,
    },
    rePrompt: {
      type: String,
      required:false,
    },
    fileData: [
      {
        name: { type: String, required: false },
        value: { type:  mongoose.Schema.Types.ObjectId, ref: PROMPTS_MODEL_NAME, default: null, required: false  },
      },
    ],
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MEMEBER_SCHEDULES_MODEL_NAME,
      default: null
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      default: null 
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

const FlowsJsonModel = mongoose.model(MODEL.FLOW_JSON, FlowJsonSchema);
module.exports = FlowsJsonModel
 
