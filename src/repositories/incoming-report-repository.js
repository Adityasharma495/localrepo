const CrudRepository = require("./crud-repository");
const incomingReportModel = require("../db/incoming-report");
const { constants} = require("../utils/common");
const dataCenterLabelType = constants.DATA_CENTER_TYPE_LABEL;

class IncomingReportRepository extends CrudRepository {
    constructor() {
        super(incomingReportModel);
      }

      
  async getAll(current_uid) {

    try {

      let response = await incomingReportModel.find({}).lean();
      return response;

    } catch (error) {
      console.log('error',error)

      throw error;

    }

  }

  async get(data) {

    try {

      const response = await this.model.findOne({ user_id: data });
      if (!response) {
        throw new AppError('Not able to find the Incoming Report', StatusCodes.NOT_FOUND);
      }
      return response;

    } catch (error) {

      throw error;

    }

  }

  async update(id, data) {
    const response = await this.model.findOneAndUpdate({ user_id: id }, data, { runValidators: true, new: true });
    return response;
  }

}

module.exports = IncomingReportRepository;