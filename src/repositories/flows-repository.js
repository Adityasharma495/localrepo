const CrudRepository = require("./crud-repository");
const { FlowModel } = require("../db");
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

class FLowRepository extends CrudRepository {

  constructor() {
    super(FlowModel);
  }

  async create(data, loggedId) {
    try {
      const { flowName, callCenterId, nodes } = data;

      if (!nodes || typeof nodes !== 'object' || Object.keys(nodes).length === 0) {
        throw new AppError('Nodes data is missing or invalid', StatusCodes.BAD_REQUEST);
      }
      const flowId = uuidv4();
      
      const nodesArray = Object.keys(nodes).map((nodeId) => {
        if (!nodeId || isNaN(parseInt(nodeId))) {
          throw new AppError(`Invalid nodeId: ${nodeId}`, StatusCodes.BAD_REQUEST);
        }
        const nodeData = nodes[nodeId];
        return {
          flowName,
          callcenterId: callCenterId,
          flowId, 
          nodeId: parseInt(nodeId, 10), 
          flowJson: nodeData.flowJson,
          status: 1,
          flowRender: nodeData.flowRender,
          createdBy: loggedId
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
      let response = await this.model.find({ flowId: flowId }).sort({ nodeId: 1 }).lean();
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
            createdBy: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $group: {
            _id: "$flowId",
            document: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$document" }
        },
        {
          $sort: { createdAt: -1 }
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
      let response = await this.model.deleteMany({ flowId: flowId });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateByFlowId(id, data) {
    const response = await this.model.updateMany({flowId: id}, data, { runValidators: true, new: true });
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
