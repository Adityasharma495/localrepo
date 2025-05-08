const CrudRepository = require("./crud-repository");
const { constants } = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { DidAllocateHistory } = require("../c_db");

class DidAllocateHistoryRepository extends CrudRepository {
  constructor() {
    super(DidAllocateHistory);
  }

  async getAll() {
    try {
        const response = await DidAllocateHistory.findAll({
            where: { is_deleted: false },
            order: [["created_at", "DESC"]],
            raw: true,
        });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(condition, data) {
    try {
      const options = {
        where: condition
      };

      const response = await this.model.update(data, options);
      return response;
    } catch (error) {

        console.log(error)
        throw error;
    }
      
  }

}

module.exports = DidAllocateHistoryRepository;
