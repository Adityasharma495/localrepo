const CrudRepository = require("./crud-repository");
const subUserLicenceModel = require("../c_db/sub-user-licence");
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

  async update(userId, data) {

    try {
      const [rowsUpdated, [updatedRecord]] = await this.model.update(data, {
        where: { id: userId },
        returning: true,
      });


      console.log("Rows updated:", rowsUpdated);
      console.log("Updated record:", updatedRecord?.dataValues || updatedRecord);
  
      if (rowsUpdated === 0) {
        throw new Error('No record found to update');
      }
  
      return updatedRecord;
    } catch (error) {
      throw error;
    }
  }
  async updatelicence(userId, data) {
    try {
      const [rowsUpdated, [updatedRecord]] = await this.model.update(data, {
        where: { user_id: userId },
        returning: true,
      });
  
      if (rowsUpdated === 0) {
        throw new Error('No record found to update');
      }
  
      return updatedRecord;
    } catch (error) {
      throw error;
    }
  }
  

  async updateById(id, data) {
    try {
      const [rowsUpdated, [updatedRecord]] = await this.model.update(data, {
        where: { id }, 
        returning: true,
      });
  
      if (rowsUpdated === 0) {
        throw new Error('No record found to update');
      }
  
      return updatedRecord;
    } catch (error) {
      throw error;
    }
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
