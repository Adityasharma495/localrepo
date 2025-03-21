const CrudRepository = require("./crud-repository");
const { FlowsJsonModel } = require("../db");

class FlowJsonRepository extends CrudRepository {

  constructor() {
    super(FlowsJsonModel);
  }

  async updateByFlowId(id, data) {
    const response = await this.model.updateMany({flow_id: id}, data, { runValidators: true, new: true });
    return response;
  }

  async deleteIVRByFlowId(flowId) {
    try {
      let response = await this.model.deleteMany({ flow_id: flowId });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findOne(conditions) {
    try {
        const response = await this.model.findOne({...conditions});
        return response;
    } catch (error) {
        throw error;
    }
  }

  async getIVRByFlowId(flowId) {
    try {
      let response = await this.model.findOne({ flow_id: flowId }).lean();
      return response;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = FlowJsonRepository;
