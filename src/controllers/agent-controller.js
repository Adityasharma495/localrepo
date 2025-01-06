const { StatusCodes } = require("http-status-codes");
const { AgentRepository, UserJourneyRepository, ExtentionRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const AppError = require("../utils/errors/app-error");

const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');

const { Logger } = require("../config");
const { AgentGroupController } = require(".");

const agentRepo = new AgentRepository();
const userJourneyRepo = new UserJourneyRepository();
const extentionRepo = new ExtentionRepository();

async function toggleStatus(req, res) {
  const { id } = req.params; // The agent's ID

  try {
    // Fetch the agent by ID
    const agent = await agentRepo.get(id);

    if (!agent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Agent not found" });
    }

    // Toggle the status
    const newStatus = agent.login_status === "1" ? "0" : "1";

  
    // Update the agent's status
    const updatedAgent = await agentRepo.update(id, { login_status: newStatus });

    if (!updatedAgent) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Failed to update agent status" });
    }

    // Log the status change
    Logger.info(`Agent -> ${id} status updated to ${newStatus}`);

    // Respond with the updated agent data
    SuccessRespnose.message = "Agent status updated successfully";
    SuccessRespnose.data = { ...updatedAgent, status: newStatus };

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Invalid agent ID";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(
      `Agent -> unable to update status for Agent: ${id}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = { createAgent, getAll, getById, updateAgent, deleteAgent, toggleStatus };


async function createAgent(req, res) {

  const bodyReq = req.body;

  try {
    const responseData = {};
    const conditions = {
      createdBy: req.user.id,
      $or: [
        { agent_number: bodyReq.agent.agent_number },
        { agent_name: bodyReq.agent.agent_name}
      ]
    };
    const checkDuplicate = await agentRepo.findOne(conditions);
    
    if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
      const duplicateField = checkDuplicate.agent_number === bodyReq.agent.agent_number ? 'Agent Number' : 'Agent Name';
      ErrorResponse.message = `${duplicateField} Already Exists`;
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    const agent = await agentRepo.create(bodyReq.agent);
    responseData.agent = agent;

    if ((bodyReq.agent?.extention).length !== 0) {
        //update extention
        await extentionRepo.update(bodyReq.agent.extention[0], {isAllocated : 1})
    }

    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT,
      action: ACTION_LABEL.ADD,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Agent";

    Logger.info(
      `Agent -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Agent -> unable to create Agent: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode;
    let errorMsg = error.message;
    if (error.name == "MongoServerError" || error.code == 11000) {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == "DuplicateKey")
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  const { data } = req.query || null;
  try {
    // const agentData = await agentRepo.getAll(req.user.id, data);
    const agentData = await agentRepo.getAllActiveAgents();
    SuccessRespnose.data = agentData;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Agent -> unable to get Agents list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getById(req, res) {
  const id = req.params.id;

  try {
    if (!id) {
      throw new AppError("Missing Agent Id", StatusCodes.BAD_REQUEST);
     }
    const agentData = await agentRepo.get(id);
    if (agentData.length == 0) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = agentData;

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Agent not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Agent -> unable to get Agent ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateAgent(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};
    const currentData = await agentRepo.get(uid);

    // Check for duplicate agent_number if it is being changed
    if (currentData.agent_number !== bodyReq.agent.agent_number) {
      const numberCondition = {
        createdBy: req.user.id,
        agent_number: bodyReq.agent.agent_number
      };
      const numberDuplicate = await agentRepo.findOne(numberCondition);
      if (numberDuplicate) {
        ErrorResponse.message = 'Agent Number already exists';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }

    // Check for duplicate agent_name if it is being changed
    if (currentData.agent_name !== bodyReq.agent.agent_name) {
      const nameCondition = {
        createdBy: req.user.id,
        agent_name: bodyReq.agent.agent_name
      };

      const nameDuplicate = await agentRepo.findOne(nameCondition);
      if (nameDuplicate) {
        ErrorResponse.message = 'Agent name already exists';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }


    //Check for extension change
    if (currentData.extention[0] && bodyReq.agent.extention[0] && (currentData.extention[0].toString() !== bodyReq.agent.extention[0].toString())) {
      if ((currentData.extention).length > 0) {
        await extentionRepo.bulkUpdate( currentData.extention, { isAllocated: 0 });
      }

      if ((bodyReq.agent.extention).length > 0) {
        await extentionRepo.bulkUpdate( bodyReq.agent.extention, { isAllocated: 1 });
      }
    }

    if ((currentData.extention).length === 0 && (bodyReq.agent.extention).length > 0) {
      if ((bodyReq.agent.extention).length > 0) {
        await extentionRepo.bulkUpdate( bodyReq.agent.extention, { isAllocated: 1 });
      }
    }

    const agent = await agentRepo.update(uid, bodyReq.agent);
    if (!agent) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    responseData.agent = agent;
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT,
      action: ACTION_LABEL.EDIT,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    Logger.info(`Agent -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode, errorMsg
    if (error.name == 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = 'Agent not found';
    }
    else if (error.name == 'MongoServerError') {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(`Agent-> unable to update Agent: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);

    return res.status(statusCode).json(ErrorResponse);

  }
}

async function deleteAgent(req, res) {
  const id = req.body.agentIds;

  try {
    const agents = await agentRepo.findMany(id);
    const extentionIds = agents.flatMap(agent => agent.extention || []);
    if (extentionIds.length > 0) {
      await extentionRepo.bulkUpdate( extentionIds, { isAllocated: 0 });
    }

    const response = await agentRepo.deleteMany(id);
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT,
      action: ACTION_LABEL.DELETE,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Agent -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Agent not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Agent -> unable to delete Agent: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}


async function updateAllocation(req, res) {
  const { agentIds } = req.body;

  try {
    // Validate the input
    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      throw new AppError("Invalid or empty agentIds array", StatusCodes.BAD_REQUEST);
    }

    // Perform the update on all matching agent IDs
    const updatedResult = await agentRepo.bulkUpdate(
      { _id: { $in: agentIds } }, // Filter for matching IDs
      { isAllocated: 1 } // Set isAllocated to 1
    );

    if (updatedResult.modifiedCount === 0) {
      throw new AppError("No agents were updated. Please check the provided IDs.", StatusCodes.BAD_REQUEST);
    }

    // Log the update
    Logger.info(`Agents allocation updated successfully for IDs: ${JSON.stringify(agentIds)}`);
    SuccessRespnose.message = "Agents successfully allocated.";
    SuccessRespnose.data = { updatedCount: updatedResult.modifiedCount };
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Invalid agent IDs provided.";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(
      `Agent -> failed to allocate agents, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateMemberScheduleAgent(req, res) {
  const { id } = req.params; // Extract the agent's ID from request parameters
  const { start_time, end_time, week_days } = req.body; // Extract schedule details from request body

  try {
    const agent = await agentRepo.get(id);
    if (!agent) {
      throw new AppError("Agent not found", StatusCodes.NOT_FOUND);
    }

    console.log("AGENT FROUNF", agent);

    const timeSchedulePayload = {
      time_schedule: {
        start_time,
        end_time,
        week_days
      }
    };

    console.log("TIME SHCEUL",timeSchedulePayload);

    const updatedAgent = await agentRepo.update(id, timeSchedulePayload);

    console.log("UPDATED AGENT", updateAgent);

    if (!updatedAgent) {
      throw new AppError(
        "Failed to update agent time schedule.",
        StatusCodes.BAD_REQUEST
      );
    }

    // Log the update
    Logger.info(
      `Agent -> ${id} time schedule updated successfully: ${JSON.stringify(timeSchedulePayload)}`
    );

    // Success response
    SuccessRespnose.message = "Agent time schedule updated successfully.";
    SuccessRespnose.data = updatedAgent;

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Invalid agent ID.";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(
      `Agent -> Failed to update time schedule for Agent ID: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}


module.exports = {createAgent, getAll, getById, updateAgent, deleteAgent, toggleStatus, updateAllocation,updateMemberScheduleAgent}