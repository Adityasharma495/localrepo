const CrudRepository = require("./crud-repository");
const { FlowModel } = require("../db");
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const mongoose = require('mongoose');

class FLowRepository extends CrudRepository {

  constructor() {
    super(FlowModel);
  }

  async create(data, loggedId, flowId) {
    try {
      const { flowName, callCenterId, nodes } = data;

      if (!nodes || typeof nodes !== 'object' || Object.keys(nodes).length === 0) {
        throw new AppError('Nodes data is missing or invalid', StatusCodes.BAD_REQUEST);
      }
      
      const nodesArray = Object.keys(nodes).map((nodeId) => {
        if (!nodeId || isNaN(parseInt(nodeId))) {
          throw new AppError(`Invalid nodeId: ${nodeId}`, StatusCodes.BAD_REQUEST);
        }
        const nodeData = nodes[nodeId];
        return {
          flow_name: flowName,
          call_center_id: callCenterId,
          flow_id: flowId, 
          node_id: parseInt(nodeId, 10), 
          flow_json: nodeData.flowJson,
          status: 1,
          flow_render: nodeData.flowRender,
          created_by: loggedId
        };
      });

      const response = await this.model.insertMany(nodesArray);

      return response;
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
        if (error.code === 11000) error.message = `Duplicate key, record already exists`;
        throw new AppError(error.message, StatusCodes.BAD_REQUEST);
      }
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getIVRByFlowId(flowId) {
    try {
      let response = await this.model.find({ flow_id: flowId }).sort({ node_id: 1 }).lean();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAll(userId) {
    try {
      let response = await this.model.aggregate([
        {
          $match: {
            created_by: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $group: {
            _id: "$flow_id",
            document: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$document" }
        },
        {
          $sort: { created_at: -1 }
        }
      ]);
  
      return response;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  }

  async deleteIVRByFlowId(flowId) {
    try {
      let response = await this.model.deleteMany({ flow_id: flowId });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateByFlowId(id, data) {
    const response = await this.model.updateMany({flow_id: id}, data, { runValidators: true, new: true });
    return response;
  }

  async findOne(conditions) {
    try {
        const response = await this.model.findOne({...conditions});
        return response;
    } catch (error) {
        throw error;
    }
}
}

module.exports = FLowRepository;
