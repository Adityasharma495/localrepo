const CrudRepository = require("./crud-repository");
const agentModel = require("../db/telephony-profile");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");



class TelephonyProfileRepository extends CrudRepository {
  constructor() {
    super(agentModel);
  }

  async createMany(data) {
    console.log(data)
    try {
        const response = await this.model.insertMany(data, { ordered: false });
        return response;
    } catch (error) {
        console.error("Error inserting multiple documents:", error);
        throw new Error("Failed to insert multiple records");
    }
}

  async getAll(current_uid) {

    try {
      let response = await agentModel.find({}).lean();
      return response;

    } catch (error) {

      throw error;

    }

  }

  async get(data) {

    try {

      const response = await this.model.findOne({ _id: data}).lean();
      if (!response) {
        throw new AppError('Not able to find the Telephony profile', StatusCodes.NOT_FOUND);
      }
      return response;

    } catch (error) {

      throw error;

    }

  }

    async hardDeleteMany(idArray) {
          try {
              const response = await this.model.deleteMany({ _id: { $in: idArray } });
              return response;
          } catch (error) {
              throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
          }
      }
}

module.exports = TelephonyProfileRepository;
