const CrudRepository = require("./crud-repository");
const { FlowControl } = require("../c_db");
const { StatusCodes } = require("http-status-codes");
const AppError = require('../utils/errors/app-error');
const sequelize = require('../config/sequelize'); 

class FlowControlRepository extends CrudRepository {
  constructor() {
    super(FlowControl);
  }

  async create(data, flowIds) {
    const transaction = await sequelize.transaction();
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

          const baseData = {
            flow_name: flowName,
            call_center_id: callCenterId,
            flow_id: flowId,
            node_id: parseInt(nodeId, 10),
            condition,
            status: 1,
            metadata: {}
          };

          if (condition === "noInput" || condition === "wrongInput") {
            return {
              ...baseData,
              next_node: null,
              metadata: {
                file_url: controlData.fileUrl,
                attempts: controlData.attempts
              }
            };
          } else {
            return {
              ...baseData,
              next_node: controlData.nodeId ? parseInt(controlData.nodeId, 10) : null
            };
          }
        });
      });

      if (flowControlsArray.length === 0) {
        throw new AppError(
          "No flowControl data found in the incoming request",
          StatusCodes.BAD_REQUEST
        );
      }
 
      const response = await this.model.bulkCreate(flowControlsArray, { transaction });
      await transaction.commit();
      return response;
    } catch (error) {
      await transaction.rollback();
      if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
        throw new AppError(error.message, StatusCodes.BAD_REQUEST);
      }
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteIVRByFlowId(flowId) {
    const transaction = await sequelize.transaction();
    try {
      
      const response = await this.model.destroy({
        where: { flow_id: flowId },
        transaction
      });
      await transaction.commit();
      return response;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = FlowControlRepository;