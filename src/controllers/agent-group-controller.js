const { StatusCodes } = require("http-status-codes");
const { AgentGroupRepository, UserJourneyRepository, MemberScheduleRepository, AgentRepository} = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const { Logger } = require("../config");
const mongoose = require('mongoose')
const agentModel = require('../db/agents')

const agentGroupRepo = new AgentGroupRepository();
const userJourneyRepo = new UserJourneyRepository();
const memberScheduleRepo = new MemberScheduleRepository();
const agentRepo = new AgentRepository();

// async function createAgentGroup(req, res) {
//   const bodyReq = req.body;

//   try {
//     const responseData = {};

//     const conditions = {
//       group_name: bodyReq.agent.group_name
//     };
//     const checkDuplicate = await agentGroupRepo.findOne(conditions);
//     if (checkDuplicate) {
//       ErrorResponse.message = 'Group Name Already Exists';
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json(ErrorResponse);
//     }

//     // Create the agent group
//     const agent = await agentGroupRepo.create(bodyReq.agent);


//     const memberData = {
//       start_time:"",
//       end_time:"",
//       week_days:[],
//     }

//     await memberScheduleRepo.create(memberData)

//     responseData.agent = agent;

//     // Log user journey for this action
//     const userJourneyfields = {
//       module_name: MODULE_LABEL.AGENT_GROUP,
//       action: ACTION_LABEL.ADD,
//       createdBy: req?.user?.id
//     };
//     await userJourneyRepo.create(userJourneyfields);

//     SuccessRespnose.data = responseData;
//     SuccessRespnose.message = "Successfully created a new Agent Group";

//     Logger.info(
//       `Agent Group -> created successfully: ${JSON.stringify(responseData)}`
//     );
//     return res.status(StatusCodes.CREATED).json(SuccessRespnose);
//   } catch (error) {

//     console.log("ERRORE HERE", error);
//     Logger.error(
//       `Agent Group -> unable to create Agent Group: ${JSON.stringify(
//         bodyReq
//       )} error: ${JSON.stringify(error)}`
//     );

//     let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
//     let errorMsg = error.message;

//     if (error.name === "MongoServerError" || error.code === 11000) {
//       statusCode = StatusCodes.BAD_REQUEST;
//       errorMsg = "Duplicate key, record already exists.";
//     }

//     ErrorResponse.message = errorMsg;
//     ErrorResponse.error = error;

//     return res.status(statusCode).json(ErrorResponse);
//   }
// }


async function createAgentGroup(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};

    const conditions = {
      group_name: bodyReq.agent.group_name
    };
    const checkDuplicate = await agentGroupRepo.findOne(conditions);
    if (checkDuplicate) {
      ErrorResponse.message = 'Group Name Already Exists';
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }

    // Generate a shared _id
    const sharedId = new mongoose.Types.ObjectId(); // Generate a new ObjectId

    // Create the agent group with the shared _id
    const agent = await agentGroupRepo.create({
      ...bodyReq.agent,
      _id: sharedId // Assign the shared _id here
    });

    // Create the member schedule with the same _id
    const memberData = {
      _id: sharedId, // Assign the shared _id here
      start_time: "",
      end_time: "",
      week_days: [],
    };

    await memberScheduleRepo.create(memberData);

    responseData.agent = agent;

    // Log user journey for this action
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT_GROUP,
      action: ACTION_LABEL.ADD,
      createdBy: req?.user?.id
    };
    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Agent Group";

    Logger.info(
      `Agent Group -> created successfully: ${JSON.stringify(responseData)}`
    );
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    console.log("ERRORE HERE", error);
    Logger.error(
      `Agent Group -> unable to create Agent Group: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "MongoServerError" || error.code === 11000) {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Duplicate key, record already exists.";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}



async function getAll(req, res) {

  console.log("CAME TO GET ALL GROUPS",req.user.id);
  try {
    const data = await agentGroupRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Agent Group -> unable to get Agent Groups list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getById(req, res) {
  const id = req.params.id;

  try {
    if (!id) {
      throw new AppError("Missing Agent Group Id", StatusCodes.BAD_REQUEST);
     }
    const agentData = await agentGroupRepo.get(id);
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
      errorMsg = "Agent Group not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Agent Group -> unable to get Agent Group ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateAgentGroup(req, res) {

  console.log("CAME TO UPDATE AGETN");
  const uid = req.params.id;
  const bodyReq =  req.body;


  try {
    const responseData = {};
    const agentGroup = await agentGroupRepo.get(uid);

    console.log("UID AND BODY REQUEST AGENT", uid,bodyReq.agent);
    const agent = await agentGroupRepo.updateGroup(uid,bodyReq.agent);

    console.log("UPDATED AGENT", agent);

    if (!agent) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }

    responseData.agent = agent;
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT_GROUP,
      action: ACTION_LABEL.EDIT,
      createdBy: req?.user?.id
    };

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    Logger.info(`Agent Group -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "An error occurred"; // Default value

    if (error.name === 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = 'Agent Group not found';
    } else if (error.name === 'MongoServerError') {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === 'DuplicateKey') {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;

    Logger.error(
      `Agent Group-> unable to update Agent Group: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}


async function deleteAgentGroup(req, res) {
  const ids = req.body.agentGroupIds;

  try {
    const response = await agentGroupRepo.deleteMany(ids);
    
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT_GROUP,
      action: ACTION_LABEL.DELETE,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Agent Group -> ${ids} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Agent Group not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Agent Group -> unable to delete Agent Group: ${ids}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAssignedAgents(req, res) {
  const groupId = req.params.id;

  try {
    if (!groupId) {
      throw new AppError("Missing Agent Group Id", StatusCodes.BAD_REQUEST);
    }

    // Fetch agent group
    const agentGroup = await agentGroupRepo.get(groupId);

    if (!agentGroup || !agentGroup.agent_id || agentGroup.agent_id.length === 0) {
      // If agent_id is empty or not defined, return an empty agents array
      SuccessRespnose.message = "No agents assigned to this group";
      SuccessRespnose.data = {
        group_id: groupId,
        group_name: agentGroup?.group_name || "Unknown Group",
        agents: []
      };

      Logger.info(`Agent Group -> No agents assigned for Group ID: ${groupId}`);
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    }

    // Fetch agents only if agent_id array is not empty
    const agents = await agentRepo.findMany(agentGroup.agent_id);

    SuccessRespnose.message = "Successfully fetched assigned agents";
    SuccessRespnose.data = {
      group_id: groupId,
      group_name: agentGroup.group_name,
      agents: agents
    };

    Logger.info(`Agent Group -> Successfully fetched assigned agents for Group ID: ${groupId}`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "An error occurred while fetching assigned agents";

    if (error.name === 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Invalid Group ID";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(
      `Agent Group -> Unable to fetch assigned agents for Group ID: ${groupId}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}




module.exports = {createAgentGroup, getAll, getById, updateAgentGroup, deleteAgentGroup,getAssignedAgents}