const CrudRepository = require("./crud-repository");
const { FlowJson } = require("../c_db");
const sequelize = require('../config/sequelize'); 

class FlowJsonRepository extends CrudRepository {
  constructor() {
    super(FlowJson);
  }

  async updateByFlowId(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const [affectedCount] = await this.model.update(data, {
        where: { flow_id: id },
        transaction,
        returning: true,  
        individualHooks: true  
      });
      
      await transaction.commit();
      
       
      if (affectedCount > 0) {
        const updatedRecords = await this.model.findAll({
          where: { flow_id: id },
          transaction,
          raw: true
        });
        return updatedRecords;
      }
      return affectedCount;
    } catch (error) {
      await transaction.rollback();
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

  async getIVRByFlowId(flowId) {
    const transaction = await sequelize.transaction();
    try {
      const response = await this.model.findOne({
        where: { flow_id: flowId },
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

  async getAll(conditions) {
      try {
        const response = await this.model.findAll({
          where: conditions,
          order: [["created_at", "DESC"]],
          raw: true,
        });
  
        return response;
      } catch (error) {
        throw error;
      }
    }
}

module.exports = FlowJsonRepository;