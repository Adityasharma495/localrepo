const CrudRepository = require("./crud-repository");
const subUserLicenceModel = require("../db/sub-user-licence");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

class SubUserLicenceRepository extends CrudRepository {
  constructor() {
    super(subUserLicenceModel);
  }

  async getAll(current_uid) {

    try {

      let response = await subUserLicenceModel.find({ is_deleted: false, created_by :  current_uid}).sort({ created_at: -1 }).lean();
      return response;

    } catch (error) {

      throw error;

    }

  }

  async get(data) {

    try {

      const response = await this.model.findOne({ _id: data, is_deleted: false }).lean();
      if (!response) {
        throw new AppError('Not able to find the Licence', StatusCodes.NOT_FOUND);
      }
      return response;

    } catch (error) {

      throw error;

    }

  }

  async update(id, data) {
    const response = await this.model.findOneAndUpdate({ _id: id}, data, { runValidators: true, new: true });
    return response;
  }

  async delete(id) {

    try {
      const check = await this.model.find({ _id: id, is_deleted: false });
      if (check.length == 0) {
        const error = new Error();
        error.name = 'Licence not found';
        throw error;
      }
      const response = await this.update(id, { is_deleted: true });
      return response;
    } catch (error) {
      throw error;
    }

  }

  async updateByUserId(id, data) {
    const response = await this.model.findOneAndUpdate({ user_id: id, is_deleted: false }, data, { runValidators: true, new: true });
    return response;
  }

}

module.exports = SubUserLicenceRepository;
