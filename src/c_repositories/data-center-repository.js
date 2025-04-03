const CrudRepository = require("./crud-repository");
// const dataCenterModel = require("../db/data_center");
const { constants } = require("../utils/common");
const dataCenterLabelType = constants.DATA_CENTER_TYPE_LABEL;
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { DataCenter } = require("../c_db");

class DataCenterRepository extends CrudRepository {
  constructor() {
    super(DataCenter); // Pass the Sequelize model to the parent class
  }

  async getAll(role, current_uid) {
    try {
      let response;

      if (role == constants.USERS_ROLE.SUPER_ADMIN) {
        response = await DataCenter.findAll({
          where: { is_deleted: false },
          order: [["created_at", "DESC"]],
          raw: true,
        });
      } else {
        response = await DataCenter.findAll({
          where: { is_deleted: false, created_by: current_uid },
          order: [["created_at", "DESC"]],
          raw: true,
        });
      }

      const formattedResponse = response.map((val) => {
        val.type = dataCenterLabelType[val.type];
        return val;
      });

      return formattedResponse;
    } catch (error) {
      throw error;
    }
  }

  async getDataCenterById(dataId) {
    try {
      // Fetch a single record by ID
      const response = await DataCenter.findOne({
        where: { id: dataId },
        raw: true,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async get(data) {
    try {
      // Fetch a single non-deleted record by ID
      const response = await DataCenter.findOne({
        where: { id: data, is_deleted: false },
        raw: true,
      });

      if (!response) {
        throw new AppError(
          "Not able to find the data center",
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
      const [updatedRows] = await DataCenter.update(data, {
        where: { id: id, is_deleted: false },
        returning: true,
      });

      if (updatedRows === 0) {
        throw new AppError(
          "Not able to find the data center",
          StatusCodes.NOT_FOUND
        );
      }
      const updatedRecord = await DataCenter.findOne({
        where: { id: id },
        raw: true,
      });

      return updatedRecord;
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

module.exports = DataCenterRepository;
