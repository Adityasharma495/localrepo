const CrudRepository = require("./crud-repository");
const numberFileListModel = require("../db/numbers-file-list");
const { constants} = require("../utils/common");


class NumberFileListRepository extends CrudRepository {
  constructor() {
    super(numberFileListModel);
  }

  async getAll() {
    try {
      let response = await numberFileListModel.find({ is_deleted: false }).populate('user_id', ["_id", "username"]).sort({ created_at: -1 }).lean();
      return response;
    } catch (error) {
      throw error;
    }

  }

}

module.exports = NumberFileListRepository;
