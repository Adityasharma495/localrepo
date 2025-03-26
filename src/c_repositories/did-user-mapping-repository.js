const CrudRepository = require("./crud-repository");
const { DIDUserMapping } = require("../c_db"); 
const { Op } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");

class DIDUserMappingRepository extends CrudRepository {
  constructor() {
    super(DIDUserMapping);
  }

  async insertMany(records) {
    try {
      if (!Array.isArray(records)) {
        throw new AppError("Records must be an array", StatusCodes.BAD_REQUEST);
      }
      return await this.model.bulkCreate(records);
    } catch (error) {
      console.error("Error in insertMany:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const [updatedRows, [updatedRecord]] = await this.model.update(data, {
        where: { id },
        returning: true,
      });

      if (updatedRows === 0) {
        throw new AppError("No record found to update", StatusCodes.NOT_FOUND);
      }

      return updatedRecord;
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  }

  async getForOthers(id) {
    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
      }

      return await this.model.findAll({
        where: { allocated_to: numericId, active: true },
        include: [
          {
            model: require("../db/users"),
            as: "allocatedUser",
            attributes: ["id", "username"],
          },
        ],
      });
    } catch (error) {
      console.error("Error in getForOthers:", error);
      throw error;
    }
  }

  async getForSuperadmin(id) {
    try {
      if (!id) {
        throw new AppError("ID is required", StatusCodes.BAD_REQUEST);
      }

      return await this.model.findAll({
        where: {
          [Op.or]: [{ allocated_to: id }, { parent_id: id }],
          active: true,
        },
      });
    } catch (error) {
      console.error("Error in getForSuperadmin:", error);
      throw error;
    }
  }

  async findOne(conditions) {
    try {
      return await this.model.findOne({ where: conditions });
    } catch (error) {
      console.error("Error in findOne:", error);
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await this.model.findByPk(id);
      if (!response) {
        throw new AppError("Not able to find the resource", StatusCodes.NOT_FOUND);
      }
      return response;
    } catch (error) {
      console.error("Error in get:", error);
      throw error;
    }
  }

  async getAll(options) {
    try {
      let whereCondition = {};

      if (options?.where) {
        whereCondition = { ...whereCondition, ...options.where };
      }

      let response = await this.model.findAll({
        where: whereCondition,
        order: [["created_at", "DESC"]],
        raw: true,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DIDUserMappingRepository;
