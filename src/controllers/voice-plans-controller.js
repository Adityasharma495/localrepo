const { StatusCodes } = require("http-status-codes");
const { VoicePlansRepository, UserJourneyRepository , UserRepository} = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const { Logger } = require("../config");
const voicePlansRepo = new VoicePlansRepository();
const userJourneyRepo = new UserJourneyRepository();
const userRepo = new UserRepository();

async function createVoicePlans(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};
    // check for duplicate Plan name
    const conditions = {
      user_id: req.user.id, 
      plan_name: bodyReq.voice_plan.plan_name 
    }

    const checkDuplicate = await voicePlansRepo.findOne(conditions);
              
    if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
      ErrorResponse.message = `Plan Name Already Exists`;
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ErrorResponse);
      }
    const updatedPlans = bodyReq.voice_plan.plans.map(plan => {
      const pulse_rupees = Number(plan.pulse_price) / 100;
      const price_per_sec = pulse_rupees / Number(plan.pulse_duration);
    
      return {
        ...plan,
        price: price_per_sec
      };
    });

    const plan_data = {
      plan_name: bodyReq.voice_plan.plan_name,
      plans: updatedPlans,
      user_id : bodyReq.voice_plan.user_id
    };

    const voice_plan = await voicePlansRepo.create(plan_data);
    responseData.voice_plan = voice_plan;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Voice Plan";

    const userJourneyfields = {
      module_name: MODULE_LABEL.VOICE_PLAN,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    Logger.info(
      `Voice Plan -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    console.log('error', error)
    Logger.error(
      `Voice Plan -> unable to create Voice Plan: ${JSON.stringify(
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
  try {
    const data = await voicePlansRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(
      `Voice Plan -> recieved all successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Voice Plan -> unable to get Voice Plan list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


async function updateVoicePlanStatus(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;
  try {

    const responseData = {};
    const voice_plan = await voicePlansRepo.update(uid, {plan_status : bodyReq.status});
    if (!voice_plan) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    responseData.voice_plan = voice_plan;

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    const userJourneyfields = {
      module_name: MODULE_LABEL.VOICE_PLAN,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    Logger.info(`Voice Plans -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    if (error.name == 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = 'Voice Plans not found';
    }
    else if (error.name == 'MongoServerError') {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(`Voice Plans-> unable to update Voice Plans: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);

    return res.status(statusCode).json(ErrorResponse);

  }
}

module.exports = {
  getAll,
  createVoicePlans,
  updateVoicePlanStatus,
};
