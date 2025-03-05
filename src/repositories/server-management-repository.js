const CrudRepository = require("./crud-repository");
const serverManagementModel = require("../db/server-management");
const { constants} = require("../utils/common");
const dataCenterLabelType = constants.DATA_CENTER_TYPE_LABEL;

class ServerManagementRepository extends CrudRepository {
    constructor() {
        super(serverManagementModel);
      }

      
  async getAll(current_uid) {

    try {

      let response = await serverManagementModel.find({ is_deleted: false }).populate('data_center', ["_id", "name"]).sort({ created_at: -1 }).lean();
      console.log('response',response)
      response = response.map(val => {
        val['type'] = dataCenterLabelType[val['type']];
        return val;
      });

      return response;

    } catch (error) {
      console.log('error',error)

      throw error;

    }

  }

  async get(data) {

    try {

      const response = await this.model.findOne({ _id: data, is_deleted: false });
      if (!response) {
        throw new AppError('Not able to find the Server', StatusCodes.NOT_FOUND);
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

module.exports = ServerManagementRepository;