const mongoose = require('mongoose');
const { MODEL } = require('../utils/common/constants')

const FlowEdgesSchema = new mongoose.Schema(
  {
    flow_id: {
      type: String,
      required:true,
    },
    edge_json: {
      type: Object, 
      required: true,
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

const FlowEdgesModel = mongoose.model(MODEL.FLOWS_EDGES, FlowEdgesSchema);

module.exports = FlowEdgesModel;

