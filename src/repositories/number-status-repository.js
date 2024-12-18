const CrudRepository = require("./crud-repository");
const numberStatusModel = require("../db/number-status");


class NumberStatusRepository extends CrudRepository {
  constructor() {
    super(numberStatusModel);
  }

  async getAll() {
    try {
        const response = await this.model.find({});
        return response;
    } catch (error) {
        throw error;
    }
  }

}

module.exports = NumberStatusRepository;
