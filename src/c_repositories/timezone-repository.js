const CrudRepository = require("./crud-repository");
const { Timezone } = require("../c_db");

class TimezoneRepository extends CrudRepository {
  constructor() {
    super(Timezone);
  }

  async getAll() {
    const response = await this.model.findAll({
      order: [["value", "ASC"]],
    });
    return response;
  }
}

module.exports = TimezoneRepository;
