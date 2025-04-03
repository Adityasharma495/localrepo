const CrudRepository = require("./crud-repository");
const trunk = require("../c_db/trunks");
const { constants, Authentication, SuccessRespnose, ErrorResponse } = require("../utils/common");
const trunkStatusValues = constants.TRUNKS_STATUS_LABEL;
const operators = constants.OPERATOR_TYPES_LABEL;
const authTypeLabels = constants.AUTH_TYPES_LABEL;

class TrunksRepository extends CrudRepository {
  constructor() {
    super(trunk);
  }

  async getAll(current_uid) {

    try {
      let response = await trunk.findAll({ is_deleted: false, createdBy: current_uid })
    //   .populate('operator', ["_id", "name"]) 
    //   .populate('server', ["_id", "server_name"])
    //   .sort({ createdAt: -1 })
    //   .lean();
    //   response = response.map(val => {
    //     val['status'] = trunkStatusValues[val['status']];
    //     // val['operator'] = operators[val['operator']];
    //     val['auth_type'] = authTypeLabels[val['auth_type']];
    //     return val;
    //   });

      return response;

    } catch (error) {

      throw error;

    }

  }

  async update(id, data) {
    try {
        // Step 1: Find the record by ID and ensure it's not deleted
        const trunk = await this.model.findOne({
            where: {
                id: id,
                is_deleted: false
            }
        });

        if (!trunk) {
            throw new Error("Trunk not found");
        }

        // Step 2: Update the record
        await trunk.update(data);

        // Step 3: Return the updated record
        return trunk;
    } catch (error) {
        throw error;
    }
}


  async get(data) {

    try {

      const response = await this.model.findByPk(data);
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
