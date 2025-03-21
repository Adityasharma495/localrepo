const CrudRepository = require("./crud-repository");
const { CountryCode } = require("../c_db");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

class CountryCodeRepository extends CrudRepository {
  constructor() {
    super(CountryCode);
  }

  async getAll() {
    try {
      const response = await this.model.findAll({
        where: { is_deleted: false },
        order: [["name", "ASC"]],
        raw: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteCountryCode(id) {
    try {
      const response = await this.model.update(
        { is_deleted: true },
        { where: { id }, returning: true }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllById(ccId) {
    try {
      const response = await this.model.findAll({
        where: {
          id: ccId,
          is_deleted: false,
        },
        raw: true,
      });
      if (!response.length) {
        throw new AppError("Invalid Country Code Id.", StatusCodes.BAD_REQUEST);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CountryCodeRepository;
