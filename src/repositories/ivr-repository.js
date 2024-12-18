const CrudRepository = require("./crud-repository");
const {ivrModel} = require("../db");

class IVRRepository extends CrudRepository {
  
  constructor() {
    super(ivrModel);
  }

  async get(data) {

    try {
        const response = await this.model.findById(data);
        if(!response) {
            throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
        }
        return response;            
    } catch (error) {
        throw error;
    }

  }

  async getAll(current_uid) {

    try {

      let response = await ivrModel.find({ is_deleted: false, createdBy: current_uid }).select({data:0, input_action_data: 0, config: 0}).sort({ createdAt: -1 }).lean();

      return response;

    } catch (error) {

      throw error;

    }

  }
  
}

module.exports = IVRRepository;
