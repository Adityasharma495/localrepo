const CrudRepository = require("./crud-repository");
const agentModel = require("../db/agents");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");



class AgentRepository extends CrudRepository {
  constructor() {
    super(agentModel);
  }

  async getAll(current_uid, check) {

    try {
      let conditions = {
        is_deleted: false,
        createdBy: current_uid,
      };
  
      // Add additional condition if `check` is 'all'
      if (check !== 'all') {
        conditions.isAllocated = 0;
      }
      let response = await agentModel.find(conditions).populate('extention').populate('createdBy').sort({ createdAt: -1 }).lean();
      return response;

    } catch (error) {

      throw error;

    }

  }

  async get(data) {

    try {

      const response = await this.model.findOne({ _id: data, is_deleted: false }).lean();
      if (!response) {
        throw new AppError('Not able to find the Agent', StatusCodes.NOT_FOUND);
      }
      return response;

    } catch (error) {

      throw error;

    }

  }

  async update(id, data) {
    const response = await this.model.findOneAndUpdate({ _id: id, is_deleted: false }, data, { runValidators: true, new: true });
    return response;
  }

  async delete(id) {

    try {
      const check = await this.model.find({ _id: id, is_deleted: false });
      if (check.length == 0) {
        const error = new Error();
        error.name = 'Agent not found';
        throw error;
      }
      const response = await this.update(id, { is_deleted: true });
      return response;
    } catch (error) {
      throw error;
    }

  }
  async bulkUpdate(filter, updateData) {
    try {
        const result = await this.model.updateMany(filter, updateData);
        return result;
    } catch (error) {
        throw new Error(`Failed to bulk update agents: ${error.message}`);
    }
}


  async findMany(ids) {
    try {
        const response = await this.model.find({ _id: { $in: ids }, is_deleted: false });
        if (response.length === 0) {
            throw new AppError('Not able to find any matching resources', StatusCodes.NOT_FOUND);
        }
        return response;            
    } catch (error) {
        throw error;
    }
  }

  async getAllActiveAgents() {
    try {
        // Fetch all agents where is_deleted is false
        const agents = await this.model.find({ is_deleted: false })
            .populate('extention')  // Populate extension details if referenced
            .populate('createdBy')  // Populate createdBy user details if referenced
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .lean(); // Return plain JavaScript objects instead of Mongoose documents

        return agents;
    } catch (error) {
        throw new AppError(`Failed to fetch active agents: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

}

module.exports = AgentRepository;
