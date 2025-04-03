const CrudRepository = require("./crud-repository");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const Licence = require("../c_db/Licence");

class LicenceRepository extends CrudRepository {
  constructor() {
    super(Licence);
  }

  async create(data) {
    try {
      const licence = await this.model.create({
        user_type: data.user_type,
        user_id: data.user_id,
        total_licence: data.total_licence ?? 0,
        available_licence: data.availeble_licence ?? 0,
        createdBy: data.createdBy
      });

      console.log("AT LAST CREATED LICESNEEE", licence);
  
      return licence;
    } catch (error) {
      throw error;
    }
  }
  

  async getAll(current_uid) {

    try {

      let response = await Licence.find({ is_deleted: false, createdBy :  current_uid}).sort({ createdAt: -1 }).lean();
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
    const response = await this.model.findOneAndUpdate({ _id: id, is_deleted: false }, data, { runValidators: true, new: true });
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

module.exports = LicenceRepository;
