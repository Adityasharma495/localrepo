const CrudRepository = require("./crud-repository");
const { DownloadReport } = require("../c_db");
const { constants } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");

class DownloadReportRepository extends CrudRepository {
  constructor() {
    super(DownloadReport);
  }

  async getAll(current_role, current_uid) {
    try {
      let response;
      if (current_role === constants.USERS_ROLE.SUPER_ADMIN) {
        response = await DownloadReport.findAll({
          where: { is_deleted: false },
          order: [["created_at", "DESC"]],
        });
      } else {
        response = await DownloadReport.findAll({
          where: {
            user_id: current_uid,
            is_deleted: false,
          },
          order: [["created_at", "DESC"]],
        });
      }
      return response;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  async getAllData(where = {}, options = {}) {
    try {
      const defaultWhere = { is_deleted: false };
      const finalWhere = { ...defaultWhere, ...where };

      const response = await DownloadReport.findAll({
        where: finalWhere,
        order: [["created_at", "DESC"]],
        ...options,  
      });

      return response;
    } catch (error) {
      console.error("Error in getAllData:", error);
      throw error;
    }
  }

  async get(data) {
    try {
      const response = await this.model.findOne({
        where: {
          user_id: data,
          is_deleted: false,
        },
      });

      if (!response) {
        throw new AppError(
          "Not able to find the Incoming Report",
          StatusCodes.NOT_FOUND
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DownloadReportRepository;
