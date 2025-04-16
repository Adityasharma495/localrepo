const CrudRepository = require("./crud-repository");
const companyModel = require("../db/companies");

class CompanyRepository extends CrudRepository {
  constructor() {
    super(companyModel);
  }

  async getAll(user_id) {
    try {
      const response = await this.model.find({created_by : user_id}).sort({ created_at: -1 });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findOne(conditions) {
    try {
        const response = await this.model.findOne({ ...conditions});
        return response;
    } catch (error) {
        throw error;
    }
}

async addUserIds(documentId, newDetail) {
  await this.model.updateOne(
    { _id: documentId },
    {
      $push: {
        users: newDetail
      }
    }
  );
}

async removeUserId(documentId, userIdToRemove) {
  await this.model.updateOne(
    { _id: documentId },
    {
      $pull: {
        users: userIdToRemove
      }
    }
  );
}

}

module.exports = CompanyRepository;
