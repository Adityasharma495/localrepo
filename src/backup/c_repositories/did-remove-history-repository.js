const CrudRepository = require("./crud-repository");
const { constants } = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { DidRemoveHistory, Numbers, VoicePlan, User } = require("../c_db");

class DidRemoveHistoryRepository extends CrudRepository {
  constructor() {
    super(DidRemoveHistory);
  }

  async getAll() {
    try {
      const response = await DidRemoveHistory.findAll({
        order: [["created_at", "DESC"]],
        include: [
          {
            model: Numbers,
            as: "did",
          },
          {
            model: VoicePlan,
            as: "voicePlan",
          },
          {
            model: User,
            as: "removeBy",
          },
        ],
      });
  
      return response;
    } catch (error) {
      throw error;
    }
  }
  

  async update(condition, data) {
    try {
      const options = {
        where: condition
      };

      const response = await this.model.update(data, options);
      return response;
    } catch (error) {

        console.log(error)
        throw error;
    }
      
  }

}

module.exports = DidRemoveHistoryRepository;
