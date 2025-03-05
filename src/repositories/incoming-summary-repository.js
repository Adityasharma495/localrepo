const CrudRepository = require("./crud-repository");
const incomingSummaryModel = require("../db/incoming-summary");
const { constants} = require("../utils/common");
const statusValues = constants.STATUS_LABEL;


class IncomingSummaryRepository extends CrudRepository {
  constructor() {
    super(incomingSummaryModel);
  }

  async getAll(userId) {

    try {

      let response = await incomingSummaryModel.find({ user_id: userId })
      .populate('user_id', ["_id", "username"])
      .populate('parent_id', ["_id", "username"])
      .populate('s_parent_id', ["_id", "username"])
      .lean();

      return response;
    } catch (error) {
      throw error;
    }

  }

}

module.exports = IncomingSummaryRepository;
