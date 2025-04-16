const { Op } = require("sequelize");
const { TelephonyProfile } = require("../c_db");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { constants } = require('../utils/common');
const CrudRepository = require('./crud-repository');
const { raw } = require("express");

class TelephonyProfileRepository extends CrudRepository {
  constructor() {
    super(TelephonyProfile)
  }

  async create(data) {
    try {
      let response;
  
      if (Array.isArray(data)) {
        // optional: handle bulk insert if needed
        const created = await this.model.bulkCreate(data, {
          include: [{ association: this.model.associations.items }],
        });
        response = created.map((item) => item.get({ plain: true }));
      } else {
        const created = await this.model.create(data, {
          include: [{ association: this.model.associations.items }],
        });
        response = created.get({ plain: true });
      }
  
      return response;
    } catch (error) {
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  
  
  

  async createMany(items) {
    try {
      const response = await this.model.bulkCreate(items, { ignoreDuplicates: true });
      return response;
    } catch (error) {
      console.error("Error inserting multiple records:", error);
      throw new AppError("Failed to insert multiple records", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getAll(current_role, current_id) {
    try {
      let response;
      if (current_role === constants.USERS_ROLE.SUPER_ADMIN) {
        response = await this.model.findAll({});
      } else {
        response = await this.model.findAll({ 
          where: { created_by: current_id }
        });
      }
      
      return response;
    } catch (error) {
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id) {
    try {
      const response = await this.model.findOne({
        where: { id },
      });

      if (!response) {
        throw new AppError('Not able to find the Telephony profile', StatusCodes.NOT_FOUND);
      }

      return response;
    } catch (error) {
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async hardDeleteMany(idArray) {
    try {
      const response = await this.model.destroy({
        where: {
          id: {
            [Op.in]: idArray
          }
        }
      });
      return response;
    } catch (error) {
      throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = TelephonyProfileRepository;
