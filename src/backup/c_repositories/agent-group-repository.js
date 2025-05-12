const CrudRepository = require("./crud-repository");
const  {AgentGroup}  = require("../c_db");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

class AgentGroupRepository extends CrudRepository {
  constructor() {
    super(AgentGroup);
  }

  async getAll(current_uid) {
    try {
      const response = await this.model.findAll({
        where: {
          is_deleted: false,
          created_by: current_uid
        },
        order: [['created_at', 'DESC']],
        raw:true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await this.model.findOne({
        where: { id, is_deleted: false },
      });

      if (!response) {
        throw new AppError('Not able to find the Agent Group', StatusCodes.NOT_FOUND);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async findOne(conditions) {
    try {
        const response = await this.model.findOne({
            where: {
              ...conditions
            }
          });
        return response;
    } catch (error) {
        throw error;
    }
}

  async create(data) {
    try {
      const response = await this.model.create(data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const [affectedRows, [updated]] = await this.model.update(data, {
        where: { id, is_deleted: false },
        returning: true
      });

      if (!affectedRows) {
        throw new AppError('Agent Group not found', StatusCodes.NOT_FOUND);
      }

      return updated;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const existing = await this.model.findOne({ where: { id, is_deleted: false } });
      if (!existing) {
        throw new AppError('Agent Group not found', StatusCodes.NOT_FOUND);
      }

      const [_, [response]] = await this.model.update({ is_deleted: true }, {
        where: { id },
        returning: true
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdate(ids, data) {
    try {
      const response = await this.model.update(data, {
        where: { id: ids },
      });

      if (response[0] === 0) {
        throw new AppError('No matching resources found to update', StatusCodes.NOT_FOUND);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateGroup(id, data) {
    try {
      const existing = await this.model.findOne({ where: { id, is_deleted: false } });

      if (!existing) {
        throw new AppError('Agent Group not found', StatusCodes.NOT_FOUND);
      }

      const updated = await this.model.update(data, {
        where: { id },
        returning: true
      });

      return updated[1][0];
    } catch (error) {
      throw new AppError(`Failed to update agent group: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = AgentGroupRepository;
