const CrudRepository = require("./crud-repository");
const agentGroupModel = require("../db/agent-group");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose")



class AgentGroupRepository extends CrudRepository {
  constructor() {
    super(agentGroupModel);
  }

  async getAll(current_uid) {
    try {
        let response = await agentGroupModel
            .find({ is_deleted: false, createdBy :  current_uid })
            .populate('agent_id') 
            .populate('createdBy')
            .sort({ createdAt: -1 })
            .lean();
        return response;
    } catch (error) {
        throw error;
    }
}

async get(data) {
  try {
      const response = await this.model
          .findOne({ _id: data, is_deleted: false })
          // .populate('agent_id') 
          .lean();
          
      if (!response) {
          throw new AppError('Not able to find the Agent Group', StatusCodes.NOT_FOUND);
      }

      return response;

  } catch (error) {
      throw error;
  }
}

async create(data) {
  try {
      const newDocument = await this.model.create(data);
      const response = await this.model.findById(newDocument._id).populate('agent_id');
      
      return response;            
  } catch (error) {
      throw error;
  }
}z

async update(id, data) {
  const response = await this.model
      .findOneAndUpdate({ _id: id, is_deleted: false }, data, { runValidators: true, new: true })
      .populate('agent_id');
  
  return response;
}

  async delete(id) {

    try {
      const check = await this.model.find({ _id: id, is_deleted: false });
      if (check.length == 0) {
        const error = new Error();
        error.name = 'Agent Group not found';
        throw error;
      }
      const response = await this.update(id, { is_deleted: true });
      return response;
    } catch (error) {
      throw error;
    }

  }

  async bulkUpdate(ids, data) {
    console.log(ids, data)
    const response = await this.model.updateMany(
        { _id: { $in: ids }},
        data,
        { runValidators: true }
    );
    
    if (response.matchedCount === 0) {
        throw new AppError('No matching resources found to update', StatusCodes.NOT_FOUND);
    }
    
    return response;
}

async updateGroup(id, data) {
  console.log("ID AND DATA", id, data);

  try {
    // Fetch the existing agent group
    const existingAgentGroup = await this.model.findOne({ _id: id, is_deleted: false });
    if (!existingAgentGroup) {
      throw new Error('Agent Group not found');
    }

    // Extract agent IDs correctly
    let newAgentIds = Array.isArray(data.agent_id) ? data.agent_id : [data.agent_id];
    
    // Filter out invalid ObjectIds
    newAgentIds = newAgentIds.filter(agentId => mongoose.Types.ObjectId.isValid(agentId));

    if (newAgentIds.length === 0) {
      throw new Error('No valid Agent IDs provided');
    }

    // Merge and remove duplicates
    const updatedAgentIds = Array.from(
      new Set([
        ...(existingAgentGroup.agent_id || []), 
        ...newAgentIds
      ])
    );

    console.log("✅ UPDATED AGENT IDS:", updatedAgentIds);

    // Update the agent group
    const response = await this.model.findOneAndUpdate(
      { _id: id, is_deleted: false },
      { agent_id: updatedAgentIds },
      { runValidators: true, new: true }
    ).populate('agent_id');

    return response;

  } catch (error) {
    throw new Error(`Failed to update agent group: ${error.message}`);
  }
}



}

module.exports = AgentGroupRepository;
