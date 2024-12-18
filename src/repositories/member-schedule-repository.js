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
        const response = await this.model.findOneAndUpdate({group_id:id},data);
        return response;
      } catch (error) {
       throw error
      }
  }
}

module.exports = MemberScheduleRepo;
