const CrudRepository = require("./crud-repository");
const { Flow } = require("../c_db");
const { StatusCodes } = require('http-status-codes');
const AppError = require("../utils/errors/app-error");
const sequelize = require('../config/sequelize'); 

class FlowRepository extends CrudRepository {
  constructor() {
    super(Flow);
  }

  async create(data, loggedId, flowId) {
    const transaction = await sequelize.transaction();
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

      const response = await this.model.bulkCreate(nodesArray, { transaction });
      await transaction.commit();
      return response;
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        if (error.errors && error.errors.some(e => e.type === 'unique violation')) {
          error.message = 'Duplicate key, record already exists';
        }
        throw new AppError(error.message, StatusCodes.BAD_REQUEST);
      }
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getIVRByFlowId(flowId) {
    const transaction = await sequelize.transaction();
    try {
      const response = await this.model.findAll({
        where: { flow_id: flowId },
        order: [['node_id', 'ASC']],
        transaction,
        raw: true
      });
      await transaction.commit();
      return response;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAll(userId) {
    const transaction = await sequelize.transaction();
    try {
      const response = await this.model.findAll({
        attributes: [
          'id',
          'flow_id',
          'flow_name',
          'call_center_id',
          'node_id',
          'status',
          'created_at',
          'updated_at',
          [sequelize.literal('DISTINCT ON ("flow_id") "flow_id"'), 'distinct_flow']
        ],
        where: { created_by: userId },
        order: [
          ['flow_id', 'ASC'],
          ['created_at', 'DESC']
        ],
        transaction,
        raw: true
      });

       
      const uniqueFlows = response.reduce((acc, current) => {
        if (!acc.some(item => item.flow_id === current.flow_id)) {
          acc.push(current);
        }
        return acc;
      }, []);

      await transaction.commit();
      return uniqueFlows;
    } catch (error) {
      await transaction.rollback();
      console.error("Error in getAll:", error);
      throw error;
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

  async updateByFlowId(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const [affectedCount, updatedRows] = await this.model.update(data, {
        where: { flow_id: id },
        transaction,
        returning: true,
        individualHooks: true
      });
      await transaction.commit();
      return updatedRows;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findOne(conditions) {
    const transaction = await sequelize.transaction();
    try {
      const response = await this.model.findOne({
        where: conditions,
        transaction,
        raw: true
      });
      await transaction.commit();
      return response;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = FlowRepository;