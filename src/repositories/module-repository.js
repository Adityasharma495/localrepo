const CrudRepository = require("./crud-repository");
const moduleModel = require("../db/module");
const { constants} = require("../utils/common");
const statusValues = constants.STATUS_LABEL;
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");



class ModuleRepository extends CrudRepository {
  constructor() {
    super(moduleModel);
  }

  async getAll(current_uid) {

    try {

      let response = await moduleModel.find({ is_deleted: false }).sort({ createdAt: -1 }).lean();
      response = response.map(val => {
        val['status'] = statusValues[val['status']];
        return val;
      });

      return response;

    } catch (error) {

      throw error;

    }

  }

  async get(data) {

    try {

      const response = await this.model.findOne({ _id: data, is_deleted: false }).lean();
      if (!response) {
        throw new AppError('Not able to find the module', StatusCodes.NOT_FOUND);
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
        error.name = 'Module not found';
        throw error;
      }
      const response = await this.update(id, { is_deleted: true });
      return response;
    } catch (error) {
      throw error;
    }

  }

}

module.exports = ModuleRepository;
