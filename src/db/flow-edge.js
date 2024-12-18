const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')

const FlowEdgesSchema = new mongoose.Schema(
  {
    flowId: {
      type: String,
      required:true,
    },
    edgeJson: {
      type: Object, 
      required: true,
    },
  },
  {
    versionKey: false, 
    timestamps: true, 
  }
);

const FlowEdgesModel = mongoose.model(MODEL.FLOWS_EDGES, FlowEdgesSchema);

module.exports = FlowEdgesModel;

