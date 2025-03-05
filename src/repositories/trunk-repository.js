const CrudRepository = require("./crud-repository");
const trunksModel = require("../db/trunks");
const { constants, Authentication, SuccessRespnose, ErrorResponse } = require("../utils/common");
const trunkStatusValues = constants.TRUNKS_STATUS_LABEL;
const operators = constants.OPERATOR_TYPES_LABEL;
const authTypeLabels = constants.AUTH_TYPES_LABEL;

class TrunksRepository extends CrudRepository {
  constructor() {
    super(trunksModel);
  }

  async getAll(current_uid) {

    try {
      let response = await trunksModel.find({ is_deleted: false, created_by: current_uid })
      .populate('operator', ["_id", "name"]) 
      .populate('server', ["_id", "server_name"])
      .sort({ created_at: -1 })
      .lean();
      response = response.map(val => {
        val['status'] = trunkStatusValues[val['status']];
        // val['operator'] = operators[val['operator']];
        val['auth_type'] = authTypeLabels[val['auth_type']];
        return val;
      });

      return response;

    } catch (error) {

      throw error;

    }

  }

  async update(id, data) {
    const response = await this.model.findOneAndUpdate({ _id: id, is_deleted: false }, data, { runValidators: true, new: true });
    return response;
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


  async delete(id) {

    try {
      const check = await this.model.find({ _id: id, is_deleted: false });
      if (check.length == 0) {
        const error = new Error();
        error.name = 'Trunk not found';
        throw error;
      }
      const response = await this.update(id, { is_deleted: true });
      return response;
    } catch (error) {
      throw error;
    }

  }


}

module.exports = TrunksRepository;
