const CrudRepository = require("./crud-repository");
const voicePlanModel = require("../db/voice-plans");
const { constants} = require("../utils/common");

class VoicePlansRepository extends CrudRepository {
  constructor() {
    super(voicePlanModel);
  }

  async getAll(current_uid) {

    try {

      let response = await voicePlanModel.find({ user_id : current_uid , plan_status: 1})
      .populate('user_id', ["_id", "username"]).sort({ req_date: -1 }).lean();
      return response;
    } catch (error) {
      throw error;
    }

  }

  async get(data) {

    try {

      const response = await this.model.findById(data);
      if (!response) {
        throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
      }
      return response;

    } catch (error) {

      throw error;

    }

  }

}

module.exports = VoicePlansRepository;
