const CrudRepository = require("./crud-repository");
const { FlowsJsonModel } = require("../db");
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { v4: uuidv4 } = require('uuid');

class FlowJsonRepository extends CrudRepository {

  constructor() {
    super(FlowsJsonModel);
  }

  async updateByFlowId(id, data) {
    const response = await this.model.updateMany({flowId: id}, data, { runValidators: true, new: true });
    return response;
  }

  async deleteIVRByFlowId(flowId) {
    try {
      let response = await this.model.deleteMany({ flowId: flowId });
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
      let response = await this.model.findOne({ flowId: flowId }).lean();
      return response;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = FlowJsonRepository;
