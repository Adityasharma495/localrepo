const CrudRepository = require("./crud-repository");
const userJourneyModel = require("../db/user-journey");
const { constants} = require("../utils/common");

class UserJourneyRepository extends CrudRepository {
  constructor() {
    super(userJourneyModel);
  }

  async getAll(current_uid, role) {

    try {
      let response;
      // If role is "Superadmin show all the Journey"
      if (role === 'role_sadmin') {
        response = await userJourneyModel.find({}).populate('createdBy', ["_id", "username"]).sort({ createdAt: -1 }).lean();
    } else {
        response = await userJourneyModel.find({ createdBy: current_uid }).populate('createdBy', ["_id", "username"]).sort({ createdAt: -1 }).lean();
    }
    return response;

    } catch (error) {

      throw error;

    }

  }
}

module.exports = UserJourneyRepository;
