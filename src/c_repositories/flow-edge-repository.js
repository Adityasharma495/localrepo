const CrudRepository = require("./crud-repository");
const { FlowEdges } = require("../c_db");
const sequelize = require('../config/sequelize');  

class FlowEdgesRepository extends CrudRepository {
  constructor() {
    super(FlowEdges);
  }

  async getAll(flowId) {
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

module.exports = FlowEdgesRepository;