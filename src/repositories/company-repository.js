const CrudRepository = require("./crud-repository");
const companyModel = require("../db/companies");

class CompanyRepository extends CrudRepository {
  constructor() {
    super(companyModel);
  }

  async getAll() {
    try {
      const response = await this.model.find().sort({ createdAt: -1 });
      return response;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = CompanyRepository;
