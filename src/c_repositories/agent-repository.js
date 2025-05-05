const CrudRepository = require("./crud-repository");
const {Agents, TelephonyProfile} = require("../c_db/");
const Users = require("../c_db/User")
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

class AgentRepository extends CrudRepository {
  constructor() {
    super(Agents);
  }

  async getAll(current_uid, check) {
    try {
      let conditions = {
        is_deleted: false,
        created_by: current_uid,
      };

      if (check !== 'all') {
        conditions.is_allocated = 0;
      }

      const response = await agentModel.findAll({
        where: conditions,
        order: [['created_at', 'DESC']],
        include: [{ association: "createdBy" }],
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await Agents.findOne({
        where: { id, is_deleted: false },
        include: [{ association: "telephonyProfile" }],
      });

      if (!response) {
        throw new AppError('Not able to find the Agent', StatusCodes.NOT_FOUND);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getByName(name){
    try {
        const user = await Agents.findOne({
          where: { agent_name : name }
        });
        return user;    
    } catch (error) {
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

  async update(id, data) {

    try {
      const [updatedRows, [updatedAgent]] = await Agents.update(data, {
        where: { id },
        returning: true,
      });

      if (!updatedRows) {
        throw new AppError("Agent not found", StatusCodes.NOT_FOUND);
      }
      return updatedAgent;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const check = await Agents.findOne({ where: { id, is_deleted: false } });

      if (!check) {
        throw new AppError('Agent not found', StatusCodes.NOT_FOUND);
      }

      await this.update(id, { is_deleted: true });
      return { message: "Agent deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdate(filter, updateData) {
    try {
      const result = await Agents.update(updateData, { where: filter });
      return result;
    } catch (error) {
      throw new AppError(`Failed to bulk update agents: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findMany(ids) {
    try {
      const response = await Agents.findAll({
        where: { id: { [Op.in]: ids }, is_deleted: false },
      });

      if (response.length === 0) {
        throw new AppError('Not able to find any matching resources', StatusCodes.NOT_FOUND);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

async findAllData() {
  const response = await this.model.findAll({
    where: { is_deleted: false },
    include: [
      {
        model: TelephonyProfile,
        as: 'agentTelephony',
        attributes: ['id', 'profile', 'created_by'],
      },
    ],
  });
  return response;
}

  async getAllActiveAgents(userId) {
    try {
      const agents = await Agents.findAll({
        where: { is_deleted: false, created_by: userId },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Users,
            as: 'creator',
            // Include all user fields
            attributes: { exclude: ['password'] }
          }
        ],
        raw: true,
        nest: true
      });
  
      // Flatten creator -> created_by
      const transformed = agents.map(agent => {
        const { creator, ...rest } = agent;
        return {
          ...rest,
          created_by: creator || {}
        };
      });
  
      return transformed;
    } catch (error) {
      throw new AppError(`Failed to fetch active agents: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  
  
}

module.exports = AgentRepository;
