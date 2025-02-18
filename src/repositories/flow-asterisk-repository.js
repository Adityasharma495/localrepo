const CrudRepository = require("./crud-repository");
const { FlowsAsteriskModel } = require("../db");
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { v4: uuidv4 } = require('uuid');

class FlowAsteriskRepository extends CrudRepository {

  constructor() {
    super(FlowsAsteriskModel);
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

}

module.exports = FlowAsteriskRepository;
