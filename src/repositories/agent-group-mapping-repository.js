const CrudRepository = require("./crud-repository");
const agentGroupMappingModel = require("../db/agent-group-mapping");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");



class AgentGroupMappingRepository extends CrudRepository {
  constructor() {
    super(agentGroupMappingModel);
  }

  async getAll(current_uid) {

    try {

      let response = await agentGroupMappingModel.find({ is_deleted: false }).sort({ created_at: -1 }).lean();
      return response;

    } catch (error) {

      throw error;

    }

  }

  async get(data) {

    try {

      const response = await this.model.findOne({ _id: data, is_deleted: false }).lean();
      if (!response) {
        throw new AppError('Not able to find the Agent Group Mapping', StatusCodes.NOT_FOUND);
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
        error.name = 'Agent Group Mapping not found';
        throw error;
      }
      const response = await this.update(id, { is_deleted: true });
      return response;
    } catch (error) {
      throw error;
    }

  }

  async deleteMapping(group_id, extension_id) {
    try {
        const check = await this.model.find({
            agent_group_id: group_id,
            extension_id: extension_id,
        });

        if (check.length === 0) {
            const error = new Error('Agent Group Mapping not found');
            error.name = 'NotFoundError';
            throw error;
        }

        // Update the record to set is_deleted to true
        const response = await this.model.updateOne(
            { 
              agent_group_id: group_id, extension_id: extension_id },
            { is_deleted: true }
        );

        return response;
    } catch (error) {
        throw error;
    }
  }

  async getByGroupId(ids) {
    try {
        const response = await this.model.find({ agent_group_id: { $in: ids }, is_deleted: false });
        if (response.length === 0) {
            throw new AppError('Not able to find any matching resources', StatusCodes.NOT_FOUND);
        }
        return response;            
    } catch (error) {
        throw error;
    }
  }

  async deleteByGroupIds(ids) {
    try {
        
        const response = await this.model.updateMany(
            { agent_group_id: { $in: ids } },
            { is_deleted: true }
        );

        return response;
    } catch (error) {
        throw error;
    }
  }  

  async getByextensionId(ids) {
    try {
        const response = await this.model.find({ extension_id: { $in: ids }, is_deleted: false });
        return response;            
    } catch (error) {
        throw error;
    }
  }

  async deleteByExtensionIds(ids) {
    try {
        
        const response = await this.model.updateMany(
            { extension_id: { $in: ids } },
            { is_deleted: true }
        );

        return response;
    } catch (error) {
        throw error;
    }
  }  

}

module.exports = AgentGroupMappingRepository;
