const CrudRepository = require("./crud-repository");
const {PromptModel} = require("../db");
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { SuccessRespnose } = require("../utils/common");

class HandleFileSaveRepo extends CrudRepository {

  constructor() {
    super(PromptModel);
  }

  async create(data) {
    try {
      const response = await this.model.create(data);
      return response;
    } catch (error) {
     throw error
    }
  }
}

module.exports = HandleFileSaveRepo;
