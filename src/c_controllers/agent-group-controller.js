
const { StatusCodes } = require("http-status-codes");
const { AgentGroupRepository, UserJourneyRepository, MemberScheduleRepo, AgentRepository, AgentGroupAgentRepository} = require("../c_repositories");
const {SuccessRespnose , ErrorResponse, ResponseFormatter} = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const { Logger } = require("../config");

const version = process.env.API_V || "1";


const agentGroupRepo = new AgentGroupRepository();
const userJourneyRepo = new UserJourneyRepository();
const memberScheduleRepo = new MemberScheduleRepo();
const agentRepo = new AgentRepository();
const agentGroupAgentsRepo = new AgentGroupAgentRepository();



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


    // Create the agent group with the shared _id
    const agent = await agentGroupRepo.create({
      ...bodyReq.agent,
    });

    responseData.agent = agent;

    // Log user journey for this action
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT_GROUP,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
    };
    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Agent Group";

    Logger.info(
      `Agent Group -> created successfully: ${JSON.stringify(responseData)}`
    );
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    console.log("error", error);
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

  try {
    const data = await agentGroupRepo.getAll(req.user.id);
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(data,version);
    SuccessRespnose.message = "Success";

    Logger.info(
      `Agent Group -> recieved all successfully`
    );

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

    Logger.info(
      `Agent Group -> recieved ${id} successfully`
    );

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

async function getAssignedAgents(req, res) {
  const groupId = req.params.id;
  let transformedAgents

  try {
    if (!groupId) {
      throw new AppError("Missing Agent Group Id", StatusCodes.BAD_REQUEST);
    }

    // Fetch agent group
    const agentGroup = await agentGroupRepo.get(groupId);

    if (!agentGroup || agentGroup.agents==null) {
      console.log("No agents found");
      transformedAgents = []
    } else {
      transformedAgents = await Promise.all(
        (agentGroup.agents).map(async (agent) => {
          const agentData = await agentRepo.get(agent.agent_id);
          let scheduleData = {}
          if (agent.member_schedule_id) {
            scheduleData = await memberScheduleRepo.get(agent.member_schedule_id);
          }
          return {
            id: agentGroup._id,
            group_name: agentGroup.group_name,
            agent: agentData,
            schedule: scheduleData,
            priority: agent?.priority || 0
          };
        })
      );
    }

    SuccessRespnose.message = "Successfully fetched assigned agents";
    SuccessRespnose.data = transformedAgents

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

async function updateAgentGroup(req, res) {

  const uid = req.params.id;
  const bodyReq =  req.body;

  try {
    const responseData = {};
    let agent;
    if (bodyReq?.agent?.type === 'time_schedule') {
      if (bodyReq.agent.group_schedule_id) {
        agent = await memberScheduleRepo.update(bodyReq.agent.group_schedule_id, {
          week_days : bodyReq.agent.weekDays,
          start_time: bodyReq.agent.startTime,
          end_time: bodyReq.agent.endTime,
       })
      } else {
        const schedule = await memberScheduleRepo.create({
          week_days : bodyReq.agent.weekDays,
          start_time: bodyReq.agent.startTime,
          end_time: bodyReq.agent.endTime,
        }) 
        agent = await agentGroupRepo.update(uid, {group_schedule_id : schedule.id})
      }

    } 
    else if (bodyReq?.agent?.type === 'add_member'){
      const agentIds = bodyReq?.agent?.agent_id;
      const preData = await agentGroupRepo.get(uid)
      



      const schedule = await memberScheduleRepo.create({
         week_days : bodyReq.agent.memberSchedulePayload.week_days,
         start_time: bodyReq.agent.memberSchedulePayload.start_time,
         end_time: bodyReq.agent.memberSchedulePayload.end_time,
      })



  
      const structuredData = agentIds.map(agentId => ({
        agent_id: agentId,
        member_schedule_id: schedule.id
      }));
      // Merge existing agents with new ones (avoiding duplicates)
      // const updatedAgents = [...preData.agents, ...structuredData].reduce((acc, curr) => {
      //   if (!acc.some(agent => agent.agent_id === curr.agent_id)) {
      //     acc.push(curr);
      //   }
      //   return acc;
      // }, []);
      
  
      agent = await agentGroupRepo.update(uid, {agents : structuredData});
  
      await agentRepo.bulkUpdate(
        { id: agentIds },
        { is_allocated: 1 } 
      );
    } else {
      agent = await agentGroupRepo.update(uid, bodyReq.agent);
    }
    
    if (!agent) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }

    responseData.agent = agent;
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT_GROUP,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id
    };

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    Logger.info(`Agent Group -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "An error occurred"; 

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

async function updateMemberScheduleAgent(req, res) {
  const { id } = req.params; 
  const bodyReq = req.body; 

  try {
    const agentGroup = await agentGroupRepo.get(id);

    console.log("AGENT GROUPS HERE", agentGroup);

    let scheduleData;
    const occurrenceCount = agentGroup.agents.filter(agent => 
      agent.member_schedule_id.toString() === bodyReq.id
    ).length;



    if (occurrenceCount > 1) {

      scheduleData = await memberScheduleRepo.create({
        start_time: bodyReq.start_time,
        end_time: bodyReq.end_time,
        week_days: bodyReq.week_days
      })

      const updatedAgents = agentGroup.agents.map(agent => {
        if (agent.agent_id.toString() === bodyReq.agent_id) {
          return { ...agent, member_schedule_id: scheduleData.id, priority : bodyReq?.priority };
        }
        return agent;
      });

      console.log("UPDATED AGENTS", updatedAgents);

      await agentGroupRepo.update(id, {agents : updatedAgents})
      
    } else {
      scheduleData = await memberScheduleRepo.update(bodyReq.id , {
        start_time: bodyReq.start_time,
        end_time: bodyReq.end_time,
        week_days: bodyReq.week_days
      })

      const updatedAgents = agentGroup.agents.map(agent => {
        if (agent.agent_id.toString() === bodyReq.agent_id) {
          return { ...agent, priority : bodyReq?.priority };
        }
        return agent;
      });

      await agentGroupRepo.update(id, {agents : updatedAgents})
    }


    // Success response
    SuccessRespnose.message = "Agent time schedule updated successfully.";
    SuccessRespnose.data = scheduleData;

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

async function deleteAgentGroup(req, res) {
  const ids = req.body.agentGroupIds;

  try {
    const response = await agentGroupRepo.deleteMany(ids);
    
    const userJourneyfields = {
      module_name: MODULE_LABEL.AGENT_GROUP,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Agent Group -> ${ids} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {

    console.log("error", error);

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


module.exports = {
    createAgentGroup,
    getAll,
    getById,
    getAssignedAgents,
    updateAgentGroup,
    updateMemberScheduleAgent,
    deleteAgentGroup,
}