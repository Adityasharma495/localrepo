const CrudRepository = require("./crud-repository");
const { IVR } = require("../c_db");  
const AppError = require("../utils/errors/app-error");

class IVRRepository extends CrudRepository {
  constructor() {
    super(IVR);
  }

  async get(id) {
    try {
      const response = await this.model.find({id: id});
      if (!response) {
        throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAll(current_uid) {
    try {
      const response = await this.model.findAll({
        where: {
          is_deleted: false,
          created_by: current_uid
        },
        attributes: { 
          exclude: ['data', 'input_action_data', 'config'] 
        },
        order: [['created_at', 'DESC']],
        raw: true // Equivalent to Mongoose's lean()
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = IVRRepository;