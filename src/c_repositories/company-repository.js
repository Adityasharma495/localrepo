const CrudRepository = require("./crud-repository");
const Company = require("../c_db/companies");

class CompanyRepository extends CrudRepository {
  constructor() {
    super(Company);
  }

  async getAll() {
    try {
      const response = await this.model.find().sort({ created_at: -1 });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async create(data) {
    try {
      const company = await this.model.create(data);
      return company;
    } catch (error) {
      console.error(" Failed to create company:", error);
      throw error;
    }
  }
  

}

module.exports = CompanyRepository;
