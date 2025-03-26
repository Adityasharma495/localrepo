const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const { MODEL } = require('../utils/common/constants')
const USER_MODEL_NAME = constants.MODEL.USERS;
const MEMEBER_SCHEDULES_MODEL_NAME = constants.MODEL.MEMEBER_SCHEDULES;
const PROMPTS_MODEL_NAME = constants.MODEL.PROMPT;


const FlowJsonSchema = new mongoose.Schema(
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
    },
    nodes_data: {
      type: Object, 
      required: true,
    },
    edges_data: {
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
    re_prompt: {
      type: String,
      required:false,
    },
    file_data: [
      {
        name: { type: String, required: false },
        value: { type:  mongoose.Schema.Types.ObjectId, ref: PROMPTS_MODEL_NAME, default: null, required: false  },
      },
    ],
    schedule_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MEMEBER_SCHEDULES_MODEL_NAME,
      default: null
    },
    is_gather_node: {
      type: Number, 
      default: 0,
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
    timestamps: true, 
  }
);

const FlowsJsonModel = mongoose.model(MODEL.FLOW_JSON, FlowJsonSchema, MODEL.FLOW_JSON);
module.exports = FlowsJsonModel
 
