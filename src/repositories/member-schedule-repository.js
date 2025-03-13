const CrudRepository = require("./crud-repository");
const {MemberSchedule} = require("../db");
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { SuccessRespnose } = require("../utils/common");

class MemberScheduleRepo extends CrudRepository {

  constructor() {
    super(MemberSchedule);
  }

  async create(data) {
    try {
      const response = await this.model.create(data);
      return response;
    } catch (error) {
     throw error
    }
  }
  

  async memberUpdate(id,data){
    try {
        const response = await this.model.findOneAndUpdate({_id:id},data);
        return response;
      } catch (error) {
       throw error
      }
  }

  async deleteByModuleId(id) {
    try {
      let response = await this.model.deleteMany({ module_id: id });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAll(id) {
    try {
      let response = await this.model.findOne({ module_id: id }).lean();
      return response;
    } catch (error) {
      throw error;
    }
  }

    async get(data) {
      try {
  
        const response = await this.model.findOne({ _id: data}).lean();
        if (!response) {
          throw new AppError('Not able to find the Member Schedule', StatusCodes.NOT_FOUND);
        }
        return response;
  
      } catch (error) {
  
        throw error;
  
      }
  
    }

    async delete(id) {
      try {
          const response = await this.model.deleteOne({ _id: id });
          return response;
      } catch (error) {
          throw error;
      }
  }
}

module.exports = MemberScheduleRepo;
