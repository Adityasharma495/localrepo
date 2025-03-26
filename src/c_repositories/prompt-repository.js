const CrudRepository = require("./crud-repository");
const { Prompt } = require("../c_db");

class PromptRepository extends CrudRepository {
  constructor() {
    super(Prompt);
  }

  async get(conditions = {}) {
    try {
      const response = await this.model.findAll({
        where: conditions
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PromptRepository;