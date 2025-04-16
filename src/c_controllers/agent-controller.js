const { StatusCodes } = require("http-status-codes");
const {SuccessRespnose , ErrorResponse, ResponseFormatter} = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const {MODULE_LABEL, ACTION_LABEL, USERS_ROLE} = require('../utils/common/constants');
const { Logger } = require("../config");
const {AgentRepository, ExtensionRepository, UserRepository, SubUserLicenceRepository, TelephonyProfileRepository, UserJourneyRepository, TelephonyProfileItemsRepository} = require('../c_repositories');
const { Op } = require("sequelize");




const version = process.env.API_V || "1";

const agentRepo = new AgentRepository();
const extensionRepo = new ExtensionRepository();
const userRepo = new UserRepository();
const subUserLicenceRepo = new SubUserLicenceRepository();
const telephonyProfileRepo = new TelephonyProfileRepository();
const telephonyProfileItemsRepo = new TelephonyProfileItemsRepository();
const userJourneyRepo = new UserJourneyRepository();

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

    if (req.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {

      //fetch logged in user sub licence data
      loggedInData = await userRepo.getForLicence(req.user.id)

      //fetch logged in user sub licence data(available_licence)
      const subLicenceData = loggedInData.sub_user_licence.available_licence
      



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

     const dara= await subUserLicenceRepo.updateById(loggedInData.sub_user_licence.id, {available_licence: updatedData})

    }
    agent = await agentRepo.create(bodyReq.agent);
    responseData.agent = agent;

    if ((bodyReq.agent?.extension).length !== 0) {
        //update extension
        extensionData = await extensionRepo.get(bodyReq.agent.extension[0])
        await extensionRepo.update(bodyReq.agent.extension[0], {is_allocated : 1})
        
    }

  //  Entry in telephony_profile

  const telephonyProfilePayload = {
    created_by: req.user.id,
    items: [
      {
        type: 'phone',
        country_code: '91',
        number: agent.agent_number,
        active_profile: false
      }
    ]
  };
  
  if (extensionData) {
    telephonyProfilePayload.items.push(
      {
        type: 'sip',
        country_code: null,
        number: extensionData.extension,
        active_profile: false
      },
      {
        type: 'webrtc',
        country_code: null,
        number: extensionData.extension,
        active_profile: false
      }
    );
  }
 


    const telephonyProfile = await telephonyProfileRepo.create(telephonyProfilePayload);



    await agentRepo.update(agent.id, {telephony_profile : telephonyProfile.id})


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


async function getAll(req, res) {
  const { data } = req.query || null;

  try {
    // const agentData = await agentRepo.getAll(req.user.id, data);
    const agentData = await agentRepo.getAllActiveAgents(req.user.id);
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(agentData, version);
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


  console.log("IDS FROM PARAMS", id);
  try {
    if (!id) {
      throw new AppError("Missing Agent Id", StatusCodes.BAD_REQUEST);
     }
    const agentData = await agentRepo.get(id);

    console.log("AGENT DATA", agentData);
    const userDetail = await userRepo.getByName(agentData.agent_name);

    agentData.username = userDetail?.username

    console.log("AGENT DATA", agentData.telephony_profile);

    const telephony_profile_id = agentData.telephony_profile;
    const telephone_profile_data = await telephonyProfileRepo.get(telephony_profile_id)
    console.log("TELE DATAD", telephone_profile_data.profile);
    const extensionDetail = await extensionRepo.get(agentData.telephony_profile?.profile[1]?.id);
    agentData.extensionName = extensionDetail?.username

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

      deletedUser.push(userDetail.id);

      const telephonyProfile = await telephonyProfileRepo.get(agent.telephony_profile);
      telephonyProfiles.push(agent.telephony_profile);
      deletedAgent.push(agent.id);
      
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
      const availableLicence = loggedInData.sub_user_licence.available_licence;

      console.log("AVAILABE LICENCE", availableLicence);

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



module.exports={
    createAgent,
    getAll,
    getById,
    deleteAgent
}