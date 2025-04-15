const { IncomingReport } = require('../c_db');
const CrudRepository = require('./crud-repository');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');

class IncomingReportRepository extends CrudRepository {
  constructor() {
    super(IncomingReport);
  }

  async getAll(current_uid) {
    try {
      const response = await this.model.findAll();
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
}

module.exports = IncomingReportRepository;
