const CrudRepository = require("./crud-repository");
const NumberStatus = require("../c_db/number-status");

class NumberStatusRepository extends CrudRepository {
  constructor() {
    super(NumberStatus);
  }

  async getAll() {
    try {
      const response = await NumberStatus.findAll({ raw: true });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NumberStatusRepository;