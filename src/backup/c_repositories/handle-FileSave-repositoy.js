const CrudRepository = require("./crud-repository");
const { Prompt } = require("../c_db");

class HandleFileSaveRepo extends CrudRepository {
  constructor() {
    super(Prompt);
  }

  async create(data) {
    try {
      const response = await this.model.create(data);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = HandleFileSaveRepo;
