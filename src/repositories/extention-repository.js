const CrudRepository = require("./crud-repository");
const extentionModel = require("../db/extention");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");



class ExtentionRepository extends CrudRepository {
  constructor() {
    super(extentionModel);
  }

  async getAll(current_uid, check) {

    try {
      let conditions = {
        is_deleted: false,
        createdBy: current_uid,
      };
  
      // Add additional condition if `check` is 'all'
      if (check !== 'all') {
        conditions.isAllocated = 0;
      }

      let response = await extentionModel.find(conditions).populate('createdBy').sort({ createdAt: -1 }).lean();
      return response;

    } catch (error) {

      throw error;

    }

  }

  async get(data) {

    try {

      const response = await this.model.findOne({ _id: data, is_deleted: false }).lean();
      if (!response) {
        throw new AppError('Not able to find the Extention', StatusCodes.NOT_FOUND);
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

  async delete(id) {

    try {
      const check = await this.model.find({ _id: id, is_deleted: false });
      if (check.length == 0) {
        const error = new Error();
        error.name = 'Extention not found';
        throw error;
      }
      const response = await this.update(id, { is_deleted: true });
      return response;
    } catch (error) {
      throw error;
    }

  }

  async bulkUpdate(ids, data) {
    const response = await this.model.updateMany(
        { _id: { $in: ids }},
        data,
        { runValidators: true }
    );
    
    if (response.matchedCount === 0) {
        throw new AppError('No matching resources found to update', StatusCodes.NOT_FOUND);
    }
    
    return response;
}

}

module.exports = ExtentionRepository;
