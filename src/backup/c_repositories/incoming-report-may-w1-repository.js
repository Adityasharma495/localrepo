const { IncomingReportMayW1 } = require('../c_db');
const CrudRepository = require('./crud-repository');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { constants } = require("../utils/common");
const moment = require("moment-timezone");
const { Op } = require('sequelize');

class IncomingReportMayW1Repository extends CrudRepository {
  constructor() {
    super(IncomingReportMayW1);
  }

  async getAll(current_role, current_uid) {
    let response;
    try {
      if (current_role === constants.USERS_ROLE.SUPER_ADMIN) {
        response = await this.model.findAll();
      } else {
        response = await this.model.findAll({ where: { user_id: current_uid } });
      }
      return response;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  async get(userId) {
    try {
      const response = await this.model.findOne({
        where: { user_id: userId },
      });

      if (!response) {
        throw new AppError('Not able to find the Incoming Report', StatusCodes.NOT_FOUND);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const [rowsUpdated, [updatedRecord]] = await this.model.update(data, {
        where: { user_id: id },
        returning: true,
      });

      if (rowsUpdated === 0) {
        throw new AppError('No record found to update', StatusCodes.NOT_FOUND);
      }

      return updatedRecord;
    } catch (error) {
      throw error;
    }
  }

  async getByDid(query) {
    try {
      const response = await this.model.findAll({
        where: query,
      });

      if (!response || response.length === 0) {
        throw new AppError('Not able to find the Incoming Report', StatusCodes.NOT_FOUND);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getByDidByDate(data, todayStart, todayEnd) {
    try {
      const isoStart = moment.utc(todayStart, 'YYYY-MM-DD HH:mm:ss').toDate();
      const isoEnd = moment.utc(todayEnd, 'YYYY-MM-DD HH:mm:ss').toDate();
  
      const query = {
        where: {
          ...data, 
          start_time: { [Op.gte]: isoStart },
          end_time: { [Op.lte]: isoEnd },
        }
      };
  
      const response = await this.model.findAll(query);
      return response;
  
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  

    async deleteMany(idArray) {
      try {
        const existingRecords = await this.model.findAll({
          where: { id: idArray },
          attributes: ['id']
        });
    
        const existingIds = existingRecords.map(record => record.id);
        const missingIds = idArray.filter(id => !existingIds.includes(id));
    
        if (missingIds.length > 0) {
          const error = new Error(`Data with id(s) ${missingIds.join(', ')} not found.`);
          error.name = "NotFoundError";
          throw error;
        }
    
        const deletedCount = await this.model.destroy({
          where: { id: idArray }
        });
    
        return { deletedCount };
      } catch (error) {
        throw error;
      }
    }
    
}

module.exports = IncomingReportMayW1Repository;
