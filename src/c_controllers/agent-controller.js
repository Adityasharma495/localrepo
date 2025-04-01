const { StatusCodes } = require("http-status-codes");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const {MODULE_LABEL, ACTION_LABEL, USERS_ROLE} = require('../utils/common/constants');
const { Logger } = require("../config");
const {AgentRepository, ExtensionRepository, UserRepository} = require('../c_repositories');
const { Op } = require("sequelize");



const agentRepo = new AgentRepository();
const extensionRepo = new ExtensionRepository();
const userRepo = new UserRepository();

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

    const checkDuplicate = await agentRepo.findOne({ where: conditions });
    

    console.log("CHECK DUPLICATE", checkDuplicate);

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

        console.log("INSIDE IF", USERS_ROLE.CALLCENTRE_ADMIN)
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

    // if ((bodyReq.agent?.extension).length !== 0) {

    //   console.log("CAME HERE FOR EXTENSION REPOR", bodyReq.agent.extension[0]);
    //     //update extension
    //     extensionData = await extensionRepo.get(bodyReq.agent.extension[0])
    //     console.log("EXTENTION DATA HERE", extensionData);
    //     await extensionRepo.update(bodyReq.agent.extension[0], {is_allocated : 1})
        
    // }

   // Entry in telephony_profile
    // const profiles = [
    //   {
    //     profile: [
    //       {
    //         id: agent._id,
    //         type: 'phone',
    //         number: {
    //           country_code: '91',
    //           number: agent.agent_number
    //         },
    //         active_profile: false
    //       }
    //     ],
    //     created_by: req.user.id
    //   }
    // ];

    // Include extensionData objects only if extensionData exists
    // if (extensionData) {
    //   profiles[0].profile.push(
    //     {
    //       id: extensionData._id,
    //       type: 'sip',
    //       number: {
    //         country_code: null,
    //         number: extensionData.extension
    //       },
    //       active_profile: false
    //     },
    //     {
    //       id: extensionData._id,
    //       type: 'webrtc',
    //       number: {
    //         country_code: null,
    //         number: extensionData.extension
    //       },
    //       active_profile: false
    //     }
    //   );
    // }
    
    // const telephonyProfile = await telephonyProfileRepo.create(profiles);
    // await agentRepo.update(agent._id, {telephony_profile : telephonyProfile[0]._id})

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



    // const userJourneyfields = {
    //   module_name: MODULE_LABEL.AGENT,
    //   action: ACTION_LABEL.ADD,
    //   created_by: req?.user?.id
    // }

    // await userJourneyRepo.create(userJourneyfields);

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
    console.log("REQUEST USER ID", req.user.id);
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



module.exports={
    createAgent,
    getAll,
    getById
}