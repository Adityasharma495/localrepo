const CrudRepository = require("./crud-repository");
const {PromptModel} = require("../db");

class PromptRepository extends CrudRepository {

  constructor() {
    super(PromptModel);
  }
  async get() {
    try {
      const response = await this.model.find();
      return response;
    } catch (error) {
     throw error
    }
  }
}

module.exports = PromptRepository;
