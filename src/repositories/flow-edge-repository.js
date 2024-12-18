const CrudRepository = require("./crud-repository");
const flowEdgeModel = require("../db/flow-edge");

class FlowEdgesRepository extends CrudRepository {
  constructor() {
    super(flowEdgeModel);
  }

  async getAll(flowId) {
    try {
      let response = await flowEdgeModel.findOne({ flowId: flowId }).lean();
      return response;
    } catch (error) {
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
}

module.exports = FlowEdgesRepository;
