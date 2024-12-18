const CrudRepository = require("./crud-repository");
const { timezoneModel } = require("../db");

class TimezoneRepository extends CrudRepository {
  
  constructor() {
    super(timezoneModel);
  } 

  async getAll() {
    const response = await this.model.find().sort('value');
    return response;
  }

}

module.exports = TimezoneRepository;
