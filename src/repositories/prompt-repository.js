const CrudRepository = require("./crud-repository");
const {PromptModel} = require("../db");

class PromptRepository extends CrudRepository {
  constructor() {
    super(PromptModel);
  }

  // Accept a query condition to filter results
  async get(conditions = {}) {
    try {
      const response = await this.model.find(conditions).sort({ createdAt: -1 }); // Apply the conditions
      return response;
    } catch (error) {
      throw error;
    }
  }
}



module.exports = PromptRepository;
