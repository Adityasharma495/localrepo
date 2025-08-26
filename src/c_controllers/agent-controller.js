const { StatusCodes } = require("http-status-codes");
const {SuccessRespnose , ErrorResponse} = require("../../shared/utils/common");
const AppError = require("../../shared/utils/errors/app-error");
const {MODULE_LABEL, ACTION_LABEL, USERS_ROLE, CALL_CONNECT} = require('../../shared/utils/common/constants');
const { Logger } = require("../../shared/config");
const {AgentRepository, ExtensionRepository, UserRepository, SubUserLicenceRepository, TelephonyProfileRepository,
  UserJourneyRepository, AgentGroupRepository, AgentScheduleMappingRepository, AsteriskCTQueueMembersRepository} = require('../../shared/c_repositories');
const { Op } = require("sequelize");
const { constants } = require("../backup/utils/common");
const User = require("../../shared/c_db/User")
const redisClient = require('../../shared/config/redis-client');

const agentGroupRepo = new AgentGroupRepository();
const agentRepo = new AgentRepository();
const userRepo = new UserRepository();
const subUserLicenceRepo = new SubUserLicenceRepository();
const telephonyProfileRepo = new TelephonyProfileRepository();
const extensionRepo = new ExtensionRepository();
const userJourneyRepo = new UserJourneyRepository();
const agentScheduleMappingRepo = new AgentScheduleMappingRepository();
const asteriskCTQueueMembersRepo = new AsteriskCTQueueMembersRepository();

async function createAgent(req, res) {

  const bodyReq = req.body;
  const responseData = {};

  try {
    let agent;
    let extensionData;
    let loggedInData


    const conditions = {
      created_by: req.user.id,
      [Op.or]: [
        { agent_number: bodyReq.agent.agent_number },
        { agent_name: bodyReq.agent.agent_name }
      ]
    };

    const checkDuplicate = await agentRepo.findOne(conditions);

    if (checkDuplicate) {
      let duplicateField = "";
      if (checkDuplicate.agent_number === bodyReq.agent.agent_number) {
        duplicateField = "Agent Number";
      } else if (checkDuplicate.agent_name === bodyReq.agent.agent_name) {
        duplicateField = "Agent Name";
      }
    
      ErrorResponse.message = `${duplicateField} Already Exists`;
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const userConditions = { username: bodyReq.agent.username }
    const checkUserDuplicate = await userRepo.findOne(userConditions);

    if (checkUserDuplicate) {
      let duplicateField = "";
      if (checkUserDuplicate.username === bodyReq.agent.username) {
        duplicateField = "User's Username";
      }
    
      ErrorResponse.message = `${duplicateField} Already Exists`;
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (req.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {

      //fetch logged in user sub licence data
      loggedInData = await userRepo.getForLicence(req.user.id)

      //fetch logged in user sub licence data(available_licence)
      const subLicenceData = loggedInData.sub_user_licence.available_licence


      // if available_licence are not 0 then update sub user licence
      const updatedData = {
        ...subLicenceData, 
        agent: Number(subLicenceData.agent || 0) - 1
      };

     await subUserLicenceRepo.updateById(loggedInData.sub_user_licence.id, {available_licence: updatedData})

    }
    agent = await agentRepo.create(bodyReq.agent);
    responseData.agent = agent;


    if ((bodyReq.agent?.extension).length !== 0) {
        //update extension
        extensionData = await extensionRepo.get(bodyReq.agent.extension[0])
        await extensionRepo.update(bodyReq.agent.extension[0], {is_allocated : 1})
        
    }


  //  Entry in telephony_profile
  let profiles = [];

  if (bodyReq.agent.type.includes('Mobile')) {
    profiles = [
      {
        items: [
          {
            id: agent.id,
            type: 'Mobile',
            number: {
              country_code: '91',
              number: agent.agent_number
            },
            active_profile: false,
            password: bodyReq.agent.password
          }
        ],
        created_by: req.user.id
      }
    ];
  }

  // Include extensionData objects only if extensionData exists
  if (
    extensionData &&
    (bodyReq.agent.type.includes('Soft Phone') || bodyReq.agent.type.includes('WEBRTC'))
  ) {
    if (profiles.length === 0) {
      profiles.push({
        items: [],
        created_by: req.user.id
      });
    }

    if (bodyReq.agent.type.includes('Soft Phone')) {
      profiles[0].items.push({
        id: extensionData.id,
        type: 'Soft Phone',
        number: {
          country_code: null,
          number: extensionData.extension
        },
        active_profile: false,
        host:CALL_CONNECT.WEBSOCKET_HOST,
        sip_port: CALL_CONNECT.SIP_PORT,
        password: bodyReq.agent.password
      });
    }

    if (bodyReq.agent.type.includes('WEBRTC')) {
      profiles[0].items.push({
        id: extensionData.id,
        type: 'WEBRTC',
        number: {
          country_code: null,
          number: extensionData.extension
        },
        active_profile: false,
        host:CALL_CONNECT.WEBSOCKET_HOST,
        port: CALL_CONNECT.WEBSOCKET_PORT,
        sip_port: CALL_CONNECT.SIP_PORT,
        password: bodyReq.agent.password
      });
    }
  }

const telephonyProfile = await telephonyProfileRepo.create(profiles);

await agentRepo.update(agent.id, {telephony_profile : telephonyProfile[0].id})

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
    console.log(error)
    Logger.error(
      `Agent -> unable to create Agent: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );
  
    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || 'Something went wrong';
  
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

async function getDescendantUserIds(userId) {
  const directChildren = await User.findAll({
    where: { created_by: userId },
    attributes: ['id'],
    raw: true,
  });
  const ids = directChildren.map(u => u.id);
  for (const childId of ids) {
    const childDescendants = await getDescendantUserIds(childId);
    ids.push(...childDescendants);
  }
  return ids;
}

async function getAll(req, res) {

  const { data } = req.query || null;
  try {
    let agentData;
    if (req.user.role === constants.USERS_ROLE.SUPER_ADMIN) {
      agentData = await agentRepo.getAllActiveAgents();
    } else {
      const userIds = [req.user.id, ...(await getDescendantUserIds(req.user.id))];
      agentData = await agentRepo.getAllActiveAgents(userIds);
    }

    // const agentData = await agentRepo.getAll(req.user.id, data);
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


    const telephony_profile_id = agentData.telephony_profile;
    const telephone_profile_data = await telephonyProfileRepo.get(telephony_profile_id)
    let extensionDetail = null
    if ((telephone_profile_data.profile).length >= 2) {
      extensionDetail = await extensionRepo.get(telephone_profile_data.profile[1]?.id);
      agentData.extensionName = extensionDetail?.username
    }

    if (agentData.length == 0) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = {
      ...agentData.get({ plain: true }),
      extensionName: extensionDetail ? extensionDetail?.username : '',
      username: userDetail?.username,
    };

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

async function getByParentId(req, res) {
  const id = req.params.id;
  const username = req.params.user;
  try {
    if (!id) {
      throw new AppError("Missing Agent Id", StatusCodes.BAD_REQUEST);
     }
    const agentData = await agentRepo.getByParentId({id: id, username: username});

    if (agentData.length == 0) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = {
      ...agentData.get({ plain: true }),
    };

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

async function deleteAgent(req, res) {
  const id = req.body.agentIds;

  try {
    const agents = await agentRepo.findMany(id);
    const allocated = [];
    const notAllocated = [];
    let response;

    agents.forEach(item => {
      if (Number(item.is_allocated) == 1) {
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
        deletedUser.push(userDetail.id);
        const telephonyProfile = await telephonyProfileRepo.get(agent.telephony_profile);
        telephonyProfiles.push(agent.telephony_profile);
        deletedAgent.push(agent.id);
        if (telephonyProfile.profile.length > 0) {
          (telephonyProfile?.profile)
                .filter(profile => profile.type === 'SIP' || profile.type === 'WEBRTC')
                .forEach(profile => {
                  if (profile.id) {
                    extensionIds.push(profile.id);
                  }
                });
        }
      }
    }

    if (notAllocated.length > 0) {
      if (extensionIds.length > 0) {
        await extensionRepo.bulkUpdate( extensionIds, { is_allocated: 0 });
      }
      if (deletedUser.length > 0) {
        await userRepo.bulkUpdate( deletedUser, { is_deleted: true });
      }
      if (telephonyProfiles.length > 0) {
        await telephonyProfileRepo.hardDeleteMany(telephonyProfiles)
      }
      response = await agentRepo.deleteMany(id);
    }

   

    if (req.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      const loggedInData = await userRepo.getForLicence(req.user.id);
      const availableLicence = loggedInData.sub_user_licence.available_licence;

      let updatedData = { ...availableLicence };
      for (const _ of id) {
          updatedData.agent = (updatedData.agent || 0) + 1;
      }

      await subUserLicenceRepo.updateById(loggedInData.sub_user_licence.id, {available_licence: updatedData})
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
    console.log(error)
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
    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      throw new AppError("Invalid or empty agentIds array", StatusCodes.BAD_REQUEST);
    }

    const updatedResult = await agentRepo.bulkUpdate(
      { id: { [Op.in]: agentIds } },
      { is_allocated: 1 }
    );

    const updatedCount = updatedResult[0];

    if (updatedCount === 0) {
      throw new AppError("No agents were updated. Please check the provided IDs.", StatusCodes.BAD_REQUEST);
    }
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT,
      action: "UPDATE ALLOCATION",
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    Logger.info(`Agents allocation updated successfully for IDs: ${JSON.stringify(agentIds)}`);
    SuccessRespnose.message = "Agents successfully allocated.";
    SuccessRespnose.data = { updatedCount };

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

    ErrorResponse.message = error.message || "Internal Server Error";
    ErrorResponse.error = error;

    Logger.error(
      `Agent -> failed to allocate agents, error: ${JSON.stringify(error)}`
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
    if (Number(currentData.agent_number) !== bodyReq.agent.agent_number) {
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

    const agent = await agentRepo.update(uid, bodyReq.agent);
    if (!agent) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }

    //update telephony profile and queue_member of asterisk_ct
    let newNumber
    const telephony_profile = currentData.telephonyProfile.profile
    telephony_profile.forEach(profile => {
      if (profile.type === 'Mobile') {
        newNumber = bodyReq.agent.agent_number
        profile.number.number = bodyReq.agent.agent_number;
      }
    });
    await telephonyProfileRepo.update(currentData.telephony_profile, {profile: telephony_profile})

    //current value
    const currentQueueData = await asteriskCTQueueMembersRepo.getAll({state_interface: `Custom:${currentData.agent_number}`})
    for (const item of currentQueueData) {
      const payload = {
        interface: `LOCAL/${bodyReq.agent.agent_number}@dial_agent`, 
        state_interface: `Custom:${bodyReq.agent.agent_number}`,
      };

      await asteriskCTQueueMembersRepo.update(item.uniqueid, payload);
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

async function toggleStatus(req, res) {
  const { id} = req.params;
  const bodyReq = req.body
  let mergedAgents;

  try {
    const agent = await agentRepo.get(id);
    if (!agent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Agent not found" });
    }

    const newStatus = agent.login_status === "1" ? "0" : "1";
    const subLicenceData = await subUserLicenceRepo.findOne({user_id : req.user.id})

    if (Number(newStatus)) {
        if (subLicenceData.available_licence.live_agent !== 0) {
          subLicenceData.available_licence.live_agent = subLicenceData.available_licence.live_agent - 1;

          const telephonyProfile = agent?.telephonyProfile?.profile.find(item => item.type === bodyReq?.type);

          if (!telephonyProfile) {
            ErrorResponse.message = `Telephony Profile not found for ${bodyReq?.type}`;
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
          }

          //get all the group associated with the agent
          const callGroup = await agentScheduleMappingRepo.getGroupWithAgentId(agent?.id)
          
          if (callGroup.length === 0) {
            ErrorResponse.message = `Agent is not in a group`;
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
          }

          for (const group of callGroup) {
            let interfaceValue = '';
            if (bodyReq?.type === 'Mobile') {
              interfaceValue = `LOCAL/${telephonyProfile?.number?.number}@dial_agent`;
            } else if (bodyReq?.type === 'Soft Phone') {
              interfaceValue = `LOCAL/${telephonyProfile?.number?.number}@dial_agent_sip`;
            } else if (bodyReq?.type === 'WEBRTC') {
              interfaceValue = `LOCAL/${telephonyProfile?.number?.number}@dial_agent_webrtc`;
            }

            await asteriskCTQueueMembersRepo.create({
              queue_name: group?.group_name,
              interface: interfaceValue,
              membername: 1,
              state_interface: `Custom:${telephonyProfile?.number?.number}`,
              paused: 0,
            });

          }

          telephonyProfile.active_profile = true;

          mergedAgents = agent?.telephonyProfile?.profile.map(agent =>
            agent.type === telephonyProfile.type ? telephonyProfile : agent
          );

          await telephonyProfileRepo.update(agent?.telephonyProfile?.id, {profile: mergedAgents})


          const userJourneyfields = {
            module_name: MODULE_LABEL.USERS,
            action: `${ACTION_LABEL.LOGIN_AS}${bodyReq?.type}`,
            created_by: req.user.id
          }

          await userJourneyRepo.create(userJourneyfields);


        } else {
          ErrorResponse.message = 'Agent Live Limit Exceeds';
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
        }
    } else {
      subLicenceData.available_licence.live_agent = subLicenceData.available_licence.live_agent + 1;
      const telephonyProfile = agent?.telephonyProfile?.profile.find(item => item.type === bodyReq?.type);

      //get all the group associated with the agent
      const callGroup = await agentScheduleMappingRepo.getGroupWithAgentId(agent?.id)
          
      for (const group of callGroup) {
        await asteriskCTQueueMembersRepo.delete({queue_name: group?.group_name, state_interface: `Custom:${telephonyProfile?.number?.number}`})
      }


      telephonyProfile.active_profile = false;

      mergedAgents = agent?.telephonyProfile?.profile.map(agent =>
        agent.type === telephonyProfile.type ? telephonyProfile : agent
      );

      await telephonyProfileRepo.update(agent?.telephonyProfile?.id, {profile: mergedAgents})

      const userJourneyfields = {
        module_name: MODULE_LABEL.USERS,
        action: `${ACTION_LABEL.LOGOUT_AS}${bodyReq?.type}`,
        created_by: req.user.id
      }
      
      await userJourneyRepo.create(userJourneyfields);
    }

    // Update the agent's status
    const updatedAgent = await agentRepo.update(id, { login_status: newStatus });

    //update sub user licence
    await subUserLicenceRepo.updateById(subLicenceData.id, {available_licence: subLicenceData.available_licence})

    if (!updatedAgent) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Failed to update agent status" });
    }

    // Log the status change
    Logger.info(`Agent -> ${id} status updated to ${newStatus}`);

    // Respond with the updated agent data
    SuccessRespnose.message = "Agent status updated successfully";
    SuccessRespnose.data = { ...updatedAgent, status: newStatus, telephonyProfile : mergedAgents };

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log(error)
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

    await sendRealTimeAgentData(req, res, isClientConnected);

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

async function sendRealTimeAgentData(req, res, isClientConnected) {
  try {
    if (!isClientConnected.value) return;
    const realTimeAgentData = await agentRealTimeData(req);

    res.write(`data: ${JSON.stringify(realTimeAgentData)}\n\n`);

  } catch (error) {
    ErrorResponse.error = { name: error.name, message: error.message };
    ErrorResponse.message = error.message;

    Logger.error(`Report -> Error retrieving Agent real time data, error: ${error}`);
  }

  if (isClientConnected.value) {
      setTimeout(() => sendRealTimeAgentData(req, res, isClientConnected), 2500);
  }
}

async function agentRealTimeData(req) {
  try {
    let agentData;
    let userDetail
    if (req.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      agentData = await agentRepo.findAllData(req.user.id);
      userDetail = await userRepo.get(req.user.id)

    } else {
      agentData = await agentRepo.findAllData();
    }
    const agentNames = agentData.map(agent => agent.agent_name);
    // const agentIds = agentData.map(agent => agent.id);

    const users = await userRepo.getByNameBulk(agentNames);
    const userMap = new Map();
    users.forEach(user => userMap.set(user.name, user));

    // Step 3: Fetch all agent-group mappings
    const scheduleMappings = await agentScheduleMappingRepo.getAll(); 

    // Step 4: Prepare a map of agent_id => Set of group_ids (for quick lookup)
    const agentGroupMap = new Map();
    scheduleMappings.forEach(mapping => {
      const agentIdStr = mapping.agent_id.toString();
      if (!agentGroupMap.has(agentIdStr)) {
        agentGroupMap.set(agentIdStr, new Set());
      }
      agentGroupMap.get(agentIdStr).add(mapping.agent_group_id.toString());
    });

    const combinedData = [];

    // Step 5: For each agent, do the group separation
    for (const agent of agentData) {
      const createdBy = agent.created_by;
      const agentIdStr = agent.id.toString();
      const user = userMap.get(agent.agent_name) || null;

      // Fetch all agent groups created by this user (creator of the agent)
      const userGroups = await agentGroupRepo.getAll(createdBy); // Fetch per-agent basis
      const userGroupIds = userGroups.map(group => group.id.toString());

      // Groups assigned to this agent (from mapping table)
      const assignedGroupIds = agentGroupMap.get(agentIdStr) || new Set();
      const assignedGroups = userGroups.filter(group =>
        assignedGroupIds.has(group.id.toString())
      );

      // Groups NOT assigned to this agent
      const notAssignedGroups = userGroups.filter(group =>
        !assignedGroupIds.has(group.id.toString())
      );

      combinedData.push({
        agent,
        user,
        agentGroup: assignedGroups,
        noAssignedGroup: notAssignedGroups,
      });
      
    }

    let queueKeys = await redisClient.keys('queue:*:*:*:calls');
    //created by callcenter only
    if (req.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      queueKeys = queueKeys.filter(key => {
        const parts = key.split(':');
        return parts.length > 2 && parts[2] === userDetail.callcenter_id;
      });
    }

    Logger.info('Queue Data from Redis -> Queue Data Fetched from Redis');
    console.log('queueKeys', queueKeys)
    const queueData = [];

    let totalCount = 0;
    let totalWaitTime = 0;
    const now = Math.floor(Date.now() / 1000);

    for (const key of queueKeys) {
      const value = await redisClient.get(key);
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        parsedValue = value;
      }

      const calls = Object.values(parsedValue);
      for (const call of calls) {
        totalCount++;
        const enqueueTime = parseInt(call.enqueueTime, 10);
        const diff = now - enqueueTime;
        totalWaitTime += diff;
      }

      queueData.push({ key, value: parsedValue });
    }

    const averageSeconds = totalCount > 0 ? totalWaitTime / totalCount : 0;

    const formatDuration = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const queuedata = {
      queueData,
      average: formatDuration(averageSeconds),
      count: totalCount
    };

    console.log('queuedata', queuedata)
    console.dir(queuedata, { depth: null });


    SuccessRespnose.data = {
      agents: combinedData,
      queues: queuedata
    };
    

    SuccessRespnose.message = 'Success';
    Logger.info('Real Time Data -> received all successfully');

    return SuccessRespnose;

  } catch (error) {
    console.log("error", error);
    ErrorResponse.error = { name: error.name, message: error.message };
    ErrorResponse.message = error.message;
    Logger.error(`Report -> Error retrieving Agent real time data, error: ${error}`);
  }
}

async function updateBreakAllocation(req, res) {
  const agent_id = req.params.id;
  const bodyReq = req.body;

  try {
    let updatedResult
    let userJourneyAction;
    if (bodyReq.break === 'Added') {
      updatedResult = await agentRepo.update(
        agent_id ,
        { break_id: bodyReq.break_id }
      );
      userJourneyAction = "BREAK APPLIED";
    } else {
      userJourneyAction = "BREAK REMOVED";
      updatedResult = await agentRepo.update(
        agent_id ,
        { break_id: null }
      );     
    }
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT,
      action: userJourneyAction,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    Logger.info(`Break ${bodyReq.break} Successfully for the Agent: ${JSON.stringify(agent_id)}`);
    SuccessRespnose.message = `Break ${bodyReq.break} Successfully`;
    SuccessRespnose.data = { updatedResult };

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log(error)
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

    ErrorResponse.message = error.message || "Internal Server Error";
    ErrorResponse.error = error;

    Logger.error(
      `Agent -> failed to ${bodyReq.break} break, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}


module.exports={
    createAgent,
    getAll,
    getById,
    deleteAgent,
    updateAgent,
    toggleStatus,
    updateAllocation,
    agentRealTimeData,
    sendRealTimeAgentData,
    getAgentRealTimeData,
    getByParentId,
    updateBreakAllocation
}