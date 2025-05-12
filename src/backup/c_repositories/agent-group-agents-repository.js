const CrudRepository = require("./crud-repository");
const { AgentGroupAgents } = require("../c_db/agent-group");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

class AgentGroupAgentsRepository extends CrudRepository {
  constructor() {
    super(AgentGroupAgents);
  }

  async getByGroupId(groupId) {
    try {
      const response = await this.model.findAll({
        where: { agent_group_id: groupId },
        raw: true,
      });

      return response;
    } catch (error) {
      throw new AppError(
        `Failed to fetch agents for group ${groupId}: ${error.message}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async bulkCreateAgents(agentsData) {
    try {
      const response = await this.model.bulkCreate(agentsData, { returning: true });
      return response;
    } catch (error) {
      throw new AppError(`Bulk agent insert failed: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteByGroupId(groupId) {
    try {
      const deletedCount = await this.model.destroy({
        where: { agent_group_id: groupId },
      });

      return deletedCount;
    } catch (error) {
      throw new AppError(
        `Failed to delete agents for group ${groupId}: ${error.message}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateAgentEntry(id, data) {
    try {
      const [updatedCount, [updatedEntry]] = await this.model.update(data, {
        where: { id },
        returning: true,
      });

      if (!updatedCount) {
        throw new AppError('Agent entry not found', StatusCodes.NOT_FOUND);
      }

      return updatedEntry;
    } catch (error) {
      throw new AppError(`Update failed: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = AgentGroupAgentsRepository;
