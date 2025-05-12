const CrudRepository = require("./crud-repository");
const Company = require("../c_db/companies");

class CompanyRepository extends CrudRepository {
  constructor() {
    super(Company);
  }

async getAll(userId) {
  try {
    const response = await this.model.findAll({
      where: {
        created_by: userId
      },
      order: [['created_at', 'DESC']],
      raw: true,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

// Company.findByPk('company-123', {
//   include: [{ model: User, as: 'users' }]
// });



  async findOne(conditions) {
    try {
        const response = await this.model.findOne({
            where: {
              ...conditions
            }
          });
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
