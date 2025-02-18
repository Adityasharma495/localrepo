const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid')
const { constants } = require('../utils/common');
const { MODEL } = require('../utils/common/constants')
const USER_MODEL_NAME = constants.MODEL.USERS;

const FlowAsteriskSchema = new mongoose.Schema(
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

const FlowsAsteriskModel = mongoose.model(MODEL.FLOW_ASTERISK, FlowAsteriskSchema);
module.exports = FlowsAsteriskModel
 
