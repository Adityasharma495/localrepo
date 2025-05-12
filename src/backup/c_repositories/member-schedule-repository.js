// const CrudRepository = require("./crud-repository");
// const {MemberSchedule} = require("../db");
// const { StatusCodes } = require('http-status-codes');
// const AppError = require('../utils/errors/app-error');
// const { SuccessRespnose } = require("../utils/common");

const CrudRepository = require("./crud-repository");
const MemberSchedule = require("../c_db/member-schedule");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");

class MemberScheduleRepo extends CrudRepository {
  constructor() {
    super(MemberSchedule);
  }

  async create(data) {
    try {
      const response = await this.model.create(data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async memberUpdate(id, data) {
    try {
      const response = await this.model.update(data, {
        where: { id },
        returning: true, 
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteByModuleId(moduleId) {
    try {
      const response = await this.model.destroy({ where: { module_id: moduleId } });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAll(moduleId) {
    try {
      const response = await this.model.findOne({ where: { module_id: moduleId }, raw: true });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await this.model.findOne({ where: { id }, raw: true });
      if (!response) {
        throw new AppError("Not able to find the Member Schedule", StatusCodes.NOT_FOUND);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await this.model.destroy({ where: { id } });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MemberScheduleRepo;

