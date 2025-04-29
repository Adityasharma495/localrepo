const { StatusCodes } = require("http-status-codes");
const { AgentRepository, UserJourneyRepository, ExtensionRepository ,
  SubUserLicenceRepository, UserRepository,
TelephonyProfileRepository, AgentGroupRepository} = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const AppError = require("../utils/errors/app-error");

const {MODULE_LABEL, ACTION_LABEL, USERS_ROLE} = require('../utils/common/constants');

const { Logger } = require("../config");

const agentRepo = new AgentRepository();
const userJourneyRepo = new UserJourneyRepository();
const extensionRepo = new ExtensionRepository();
const subUserLicenceRepo = new SubUserLicenceRepository();
const userRepo = new UserRepository();
const telephonyProfileRepo = new TelephonyProfileRepository();
const agentGroupRepo = new AgentGroupRepository();


async function toggleStatus(req, res) {
  const { id } = req.params; // The agent's ID

  try {
    // Fetch the agent by ID
    const agent = await agentRepo.get(id);
    console.log('agent', agent)
    const agentUser = await userRepo.getByName(agent.agent_name)

    console.log('agentUser', agentUser)

    if (!agent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Agent not found" });
    }

    // Toggle the status
    const newStatus = agent.login_status === "1" ? "0" : "1";

    const subLicenceData = await subUserLicenceRepo.findOne({user_id : req.user.id})

    if (Number(newStatus)) {
      if (subLicenceData.available_licence.live_agent !== 0) {
         subLicenceData.available_licence.live_agent = subLicenceData.available_licence.live_agent - 1;

        const userLoginCount = await userRepo.find({
               where: {
                 _id: agentUser._id,
                 logout_at: null
               }
        });
         
        if (userLoginCount && userLoginCount.length > 0) {
          ErrorResponse.message = 'User already logged in';
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        await userRepo.update(agentUser._id, {
          login_at: Date.now(),
          logout_at: null,
          duration: null
        });

      } else {
        ErrorResponse.message = 'Agent Live Limit Exceeds';
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ErrorResponse);
      }
    } else {
      subLicenceData.available_licence.live_agent = subLicenceData.available_licence.live_agent + 1;

      await userRepo.update(agentUser._id, {
        logout_at: Date.now(),
      })
  
      const userData = await userRepo.findOne({_id: agentUser._id})
      const duration = getTimeDifferenceInSeconds(userData.login_at, userData.logout_at)

      await userRepo.update(agentUser._id, {
        duration
      })
    }

    // Update the agent's status
    const updatedAgent = await agentRepo.update(id, { login_status: newStatus });

    //update sub user licence
    await subUserLicenceRepo.updateById(subLicenceData._id, {available_licence: subLicenceData.available_licence})

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

function getTimeDifferenceInSeconds(login, logout) {
  const loginTimestamp = Date.parse(login);
  const logoutTimestamp = Date.parse(logout);

  const diffMs = logoutTimestamp - loginTimestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  return diffSeconds;
}

module.exports = { createAgent, getAll, getById, updateAgent, deleteAgent, toggleStatus };


async function createAgent(req, res) {

  const bodyReq = req.body;
  const responseData = {};

  try {
    let agent;
    let extensionData;
    let loggedInData
    const conditions = {
      created_by: req.user.id,
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

    if (req.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      //fetch logged in user sub licence data
      loggedInData = await userRepo.getForLicence(req.user.id)

      //fetch logged in user sub licence data(available_licence)
      const subLicenceData = loggedInData.sub_user_licence_id.available_licence
      
      // if available_licence are 0 then return
      if (Number(subLicenceData.agent) === 0) {
         ErrorResponse.message = 'Licence is not available';
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
      }

      // if available_licence are not 0 then update sub user licence
      const updatedData = {
        ...subLicenceData, 
        agent: Number(subLicenceData.agent || 0) - 1
      };
      await subUserLicenceRepo.updateById(loggedInData.sub_user_licence_id._id, {available_licence: updatedData})

    }
    agent = await agentRepo.create(bodyReq.agent);
    responseData.agent = agent;

    if ((bodyReq.agent?.extension).length !== 0) {
        //update extension
        await extensionRepo.update(bodyReq.agent.extension[0], {is_allocated : 1})
        extensionData = await extensionRepo.get(bodyReq.agent.extension[0])
    }

   // Entry in telephony_profile
    const profiles = [
      {
        profile: [
          {
            id: agent._id,
            type: 'PSTN',
            number: {
              country_code: '91',
              number: agent.agent_number
            },
            active_profile: false
          }
        ],
        created_by: req.user.id
      }
    ];

    // Include extensionData objects only if extensionData exists
    if (extensionData) {
      profiles[0].profile.push(
        {
          id: extensionData._id,
          type: 'SIP',
          number: {
            country_code: null,
            number: extensionData.extension
          },
          active_profile: false
        },
        {
          id: extensionData._id,
          type: 'WEBRTC',
          number: {
            country_code: null,
            number: extensionData.extension
          },
          active_profile: false
        }
      );
    }
    
    const telephonyProfile = await telephonyProfileRepo.create(profiles);
    await agentRepo.update(agent._id, {telephony_profile : telephonyProfile[0]._id})

    // Entry in Users Table
    await userRepo.create({
      acl_settings: null,
      email: bodyReq.agent.email_id,
      password: bodyReq.agent.password,
      name: bodyReq.agent.agent_name,
      role: "role_ccagent" , 
      username: bodyReq.agent.username,
      created_by: req.user.id
    })


    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
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
    const agentData = await agentRepo.getAllActiveAgents(req.user.id);
    SuccessRespnose.data = agentData;
    SuccessRespnose.message = "Success";

    Logger.info(
      `Agent -> recieved all successfully`
    );

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
    const userDetail = await userRepo.getByName(agentData.agent_name);
    agentData.username = userDetail?.username
    let extensionDetail;
    if (agentData.telephony_profile?.profile[1]?.id) {
      extensionDetail = await extensionRepo.get(agentData.telephony_profile?.profile[1]?.id);
    }
    agentData.extensionName = extensionDetail?.username || ''

    if (agentData.length == 0) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = agentData;
    Logger.info(
      `Agent -> recieved ${id} successfully`
    );

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
        created_by: req.user.id,
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
        created_by: req.user.id,
        agent_name: bodyReq.agent.agent_name
      };

      const nameDuplicate = await agentRepo.findOne(nameCondition);
      if (nameDuplicate) {
        ErrorResponse.message = 'Agent name already exists';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }

    //Check for extension change
    // if (currentData.extension[0] && bodyReq.agent.extension[0] && (currentData.extension[0].toString() !== bodyReq.agent.extension[0].toString())) {
    //   if ((currentData.extension).length > 0) {
    //     await extensionRepo.bulkUpdate( currentData.extension, { is_allocated: 0 });
    //   }

    //   if ((bodyReq.agent.extension).length > 0) {
    //     await extensionRepo.bulkUpdate( bodyReq.agent.extension, { is_allocated: 1 });
    //   }
    // }

    // if ((currentData.extension).length === 0 && (bodyReq.agent.extension).length > 0) {
    //   if ((bodyReq.agent.extension).length > 0) {
    //     await extensionRepo.bulkUpdate( bodyReq.agent.extension, { is_allocated: 1 });
    //   }
    // }

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
      created_by: req?.user?.id
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
    const allocated = [];
    const notAllocated = [];
    let response;

    agents.forEach(item => {
      if (item.is_allocated === 1) {
        allocated.push(item.agent_name);
      } else {
        notAllocated.push(item);
      }
    });

    const extensionIds = []
    const telephonyProfiles = []
    const deletedAgent = []
    const deletedUser = []
 
   // get extension ids from telephony_profile
   for (const agent of notAllocated) {
    if (agent.telephony_profile) {
      
      const userDetail = await userRepo.getByName(agent.agent_name);
      deletedUser.push(userDetail._id);

      const telephonyProfile = await telephonyProfileRepo.get(agent.telephony_profile);
      telephonyProfiles.push(agent.telephony_profile);
      deletedAgent.push(agent._id);
      
      if (telephonyProfile.profile.length > 1) {
        extensionIds.push(telephonyProfile.profile[1].id);
      }
    }
  }

    if (notAllocated.length > 0) {
      await extensionRepo.bulkUpdate( extensionIds, { is_allocated: 0 });
      await userRepo.bulkUpdate( deletedUser, { is_deleted: true });
  
      await telephonyProfileRepo.hardDeleteMany(telephonyProfiles)
      response = await agentRepo.deleteMany(id);
    }

   

    if (req.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      const loggedInData = await userRepo.getForLicence(req.user.id);
      const availableLicence = loggedInData.sub_user_licence_id.available_licence;
      let updatedData = { ...availableLicence };
      for (const _ of id) {
          updatedData.agent = (updatedData.agent || 0) + 1;
      }

      await subUserLicenceRepo.updateById(loggedInData.sub_user_licence_id._id, {available_licence: updatedData})
    }


    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id
    }

    Logger.info(`Agent -> ${notAllocated} deleted successfully`);

    await userJourneyRepo.create(userJourneyfields);
    if (allocated.length > 0) {
      SuccessRespnose.message = `${allocated} agents not deleted as they are in Agents Groups.`;
      SuccessRespnose.data = response
      return res.status(StatusCodes.BAD_REQUEST).json(SuccessRespnose);
    } else {
      SuccessRespnose.message = `Agent Deleted Successfully`;
      SuccessRespnose.data = response;
      return res.status(StatusCodes.OK).json(SuccessRespnose);

    }


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
      { is_allocated: 1 } // Set is_allocated to 1
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
  const { id } = req.params; 
  const { start_time, end_time, week_days } = req.body; 

  try {
    const agent = await agentRepo.get(id);
    if (!agent) {
      throw new AppError("Agent not found", StatusCodes.NOT_FOUND);
    }

    const timeSchedulePayload = {
      time_schedule: {
        start_time,
        end_time,
        week_days
      }
    };


    const updatedAgent = await agentRepo.update(id, timeSchedulePayload);


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

async function getAgentRealTimeData(req, res) {
  //headers for server-sent events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let isClientConnected = { value: true };

  try {
    req.on('close', () => {
      isClientConnected.value = false;
      res.end();
    });

    await sendRealTimeAgentData(res, isClientConnected);

  } catch (error) {
    ErrorResponse.error = { name: error.name, message: error.message };
    ErrorResponse.message = error.message;

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    if (error instanceof AppError) {
      statusCode = error.statusCode;
    }

    Logger.error(`Real Time Data -> Error retrieving Real Time Data Of Agents, error: ${error}`);

    return res.status(statusCode).json(ErrorResponse);

  }

}

async function sendRealTimeAgentData(res, isClientConnected) {
  try {
    if (!isClientConnected.value) return;
    const realTimeAgentData = await agentRealTimeData();

    res.write(`data: ${JSON.stringify(realTimeAgentData)}\n\n`);

  } catch (error) {
    ErrorResponse.error = { name: error.name, message: error.message };
    ErrorResponse.message = error.message;

    Logger.error(`Report -> Error retrieving Agent real time data, error: ${error}`);
  }

  if (isClientConnected.value) {
      setTimeout(() => sendRealTimeAgentData(res, isClientConnected), 4000);
  }
}

async function agentRealTimeData() {
  try {
    const agentData = await agentRepo.findAllData();
    const agentNames = agentData.map(agent => agent.agent_name);
    const agentIds = agentData.map(agent => agent.id);

    // Fetch users and agent groups
    const users = await userRepo.getByNameBulk(agentNames);
    const agentGroups = await agentGroupRepo.getAll(agentData[0]?.created_by); // Full group list

    // Map users by name
    const userMap = new Map();
    users.forEach(user => userMap.set(user.name, user));

    // Map agent_id to all associated groups
    const agentToGroupsMap = new Map();
    agentGroups.forEach(group => {
      group.agents.forEach(agentEntry => {
        const agentId = agentEntry.agent_id.toString();
        if (!agentToGroupsMap.has(agentId)) {
          agentToGroupsMap.set(agentId, []);
        }
        agentToGroupsMap.get(agentId).push(group);
      });
    });

    // Combine data
    const combinedData = agentData.map(agent => {
      const agentIdStr = agent._id.toString();
      const assignedGroups = agentToGroupsMap.get(agentIdStr) || [];

      // Get groups where this agent is NOT assigned
      const noAssignedGroup = agentGroups.filter(group =>
        group.agents.every(entry => entry.agent_id.toString() !== agentIdStr)
      );

      return {
        agent: agent,
        user: userMap.get(agent.agent_name) || null,
        agentGroup: assignedGroups,
        noAssignedGroup: noAssignedGroup,
      };
    });

    SuccessRespnose.data = combinedData;
    SuccessRespnose.message = "Success";

    Logger.info(`Real Time Data -> received all successfully`);
    return SuccessRespnose;

  } catch (error) {
    ErrorResponse.error = { name: error.name, message: error.message };
    ErrorResponse.message = error.message;

    Logger.error(`Report -> Error retrieving Agent real time data, error: ${error}`);
  }
}



module.exports = {createAgent, getAll, getById, updateAgent, deleteAgent, toggleStatus, updateAllocation,updateMemberScheduleAgent, getAgentRealTimeData}