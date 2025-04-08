const { Module } = require("../c_db");
const { constants } = require("../utils/common");
const statusValues = constants.STATUS_LABEL;
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const CrudRepository = require("./crud-repository");

class ModuleRepository extends CrudRepository {
  constructor() {
    super(Module);
  }

  async getAll(current_user_role, current_user_id) {
    try {
      let response;

      if (current_user_role === constants.USERS_ROLE.SUPER_ADMIN) {
        response = await this.model.findAll({
          where: { is_deleted: false },
          order: [["created_at", "DESC"]],
          raw: true,
        });
      } else {
        response = await this.model.findAll({
          where: { is_deleted: false, created_by: current_user_id },
          order: [["created_at", "DESC"]],
          raw: true,
        });
      }

      response = response.map((val) => {
        val["status"] = statusValues[val["status"]];
        return val;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await this.model.findOne({
        where: { id, is_deleted: false },
        raw: true,
      });

      if (!response) {
        throw new AppError(
          "Not able to find the module",
          StatusCodes.NOT_FOUND
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const [updatedRows, [updatedModule]] = await this.model.update(data, {
        where: { id, is_deleted: false },
        returning: true,
      });

      if (!updatedRows) {
        throw new AppError(
          "Module not found or already deleted",
          StatusCodes.NOT_FOUND
        );
      }

      return updatedModule;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const moduleExists = await this.model.findOne({
        where: { id, is_deleted: false },
      });

      if (!moduleExists) {
        throw new AppError("Module not found", StatusCodes.NOT_FOUND);
      }

      await this.update(id, { is_deleted: true });

      return { message: "Module deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  async deleteMany(idArray) {
    try {
      const check = await this.model.findAll({
        where: { id: idArray, is_deleted: false },
        attributes: ['id']
      });

      const checkData = check.map((obj) => obj.id.toString());
  
      if (checkData.length !== idArray.length) {
        const notFoundElement = idArray.filter((x) => !checkData.includes(x));
        const error = new Error(`Data with id(s) ${notFoundElement.join(', ')} not found.`);
        throw error;
      }
      const response = await this.model.update(
        { is_deleted: true },
        { where: { id: idArray } }
      );
  
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ModuleRepository;
