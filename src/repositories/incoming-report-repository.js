const CrudRepository = require("./crud-repository");
const incomingReportModel = require("../db/incoming-report");
const { constants} = require("../utils/common");
const dataCenterLabelType = constants.DATA_CENTER_TYPE_LABEL;
const moment = require("moment-timezone");

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

  async getByDid(data) {

    try {
      const response = await this.model.find(data);
      if (!response) {
        throw new AppError('Not able to find the Incoming Report', StatusCodes.NOT_FOUND);
      }
      return response;

    } catch (error) {

      throw error;

    }

  }

  async getByDidByDate(data, todayStart, todayEnd) {
    try {

      const isoStart = moment.utc(todayStart, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      const isoEnd = moment.utc(todayEnd, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

      const query = {
        ...data, 
        start_time: { $gte: isoStart },
        end_time: { $lte: isoEnd },
      };
  
      const response = await this.model.find(query);
      return response;
  
    } catch (error) {
      console.log(error)
      throw error;
    }
  }
  

}

module.exports = IncomingReportRepository;