const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid')

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
  },
  {
    versionKey: false, 
    timestamps: true, 
  }
);


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
