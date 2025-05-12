const CrudRepository = require("./crud-repository");
const { Codecs } = require("../c_db");

class CodecRepository extends CrudRepository {
  constructor() {
    super(Codecs);
  }

  async getAll() {
    try {
      const response = await this.model.findAll({
        order: [["name", "ASC"]],
        raw: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CodecRepository;
