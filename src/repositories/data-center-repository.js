const CrudRepository = require("./crud-repository");
const dataCenterModel = require("../db/data_center");
const { constants} = require("../utils/common");
const dataCenterLabelType = constants.DATA_CENTER_TYPE_LABEL;
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");



class DataCenterRepository extends CrudRepository {
  constructor() {
    super(dataCenterModel);
  }

  async getAll(current_uid) {

    try {

      let response = await dataCenterModel.find({ is_deleted: false }).sort({ created_at: -1 }).lean();
      response = response.map(val => {
        val['type'] = dataCenterLabelType[val['type']];
        return val;
      });

      return response;

    } catch (error) {

      throw error;

    }

  }

  async getDataCenterById(dataId) {
    try {
      let response = await this.model.findById(dataId).lean();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async get(data) {

    try {

      const response = await this.model.findOne({ _id: data, is_deleted: false }).lean();
      if (!response) {
        throw new AppError('Not able to find the data center', StatusCodes.NOT_FOUND);
      }
      return response;

    } catch (error) {

      throw error;

    }

  }

  async update(id, data) {
    const response = await this.model.findOneAndUpdate({ _id: id, is_deleted: false }, data, { runValidators: true, new: true });
    return response;
  }

}

module.exports = DataCenterRepository;
