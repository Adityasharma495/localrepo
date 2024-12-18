const CrudRepository = require("./crud-repository");
const { FlowControlModel } = require("../db");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");

class FlowControlRepository extends CrudRepository {
  constructor() {
    super(FlowControlModel);
  }

  async create(data, flowIds) {
    try {
      const { flowName, callCenterId, nodes } = data;

      if (!nodes || typeof nodes !== "object" || Object.keys(nodes).length === 0) {
        throw new AppError("Nodes data is missing or invalid", StatusCodes.BAD_REQUEST);
      }

      const flowId = flowIds; 

      
      const flowControlsArray = Object.keys(nodes).flatMap((nodeId) => {
        const nodeData = nodes[nodeId];

        if (!nodeData.flowControl) {
          return []; 
        }

      
        return Object.keys(nodeData.flowControl).map((condition) => {
          const controlData = nodeData.flowControl[condition];

          if (condition === "noInput" || condition === "wrongInput") {
            
            return {
              flowName,
              callcenterId: callCenterId,
              flowId,
              nodeId: parseInt(nodeId, 10),
              condition,
              nextNode: null, 
              status: 1,
              metadata: {
                fileUrl: controlData.fileUrl,
                attempts: controlData.attempts,
              },
            };
          } else {
            return {
              flowName,
              callcenterId: callCenterId,
              flowId,
              nodeId: parseInt(nodeId, 10),
              condition,
              nextNode: controlData.nodeId ? parseInt(controlData.nodeId, 10) : null,
              status: 1,
            };
          }
        });
      });

      if (flowControlsArray.length === 0) {
        throw new AppError("No flowControl data found in the incoming request", StatusCodes.BAD_REQUEST);
      }

      const response = await this.model.insertMany(flowControlsArray);
      return response;
    } catch (error) {
      if (error.name === "ValidationError" || error.name === "MongoServerError") {
        if (error.code === 11000) error.message = `Duplicate key, record already exists`;
        throw new AppError(error.message, StatusCodes.BAD_REQUEST);
      }
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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
}

module.exports = FlowControlRepository;
