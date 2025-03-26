const CrudRepository = require("./crud-repository");
const downloadReportModel = require("../db/download-report");

class DownloadReportRepository extends CrudRepository {
    constructor() {
        super(downloadReportModel);
      }

      
  async getAll(current_uid) {

    try {
      const query = current_uid ? { user_id: current_uid } : {};
      let response = await downloadReportModel.find(query).lean();
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
}

module.exports = DownloadReportRepository;