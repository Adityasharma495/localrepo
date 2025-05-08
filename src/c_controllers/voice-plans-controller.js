const { StatusCodes } = require("http-status-codes");
const { VoicePlansRepository, UserJourneyRepository, NumbersRepository, DIDUserMappingRepository, DidAllocateHistoryRepository } = require("../c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../utils/common");
const { MODULE_LABEL, ACTION_LABEL } = require("../utils/common/constants");
const { Logger } = require("../config");
const sequelize = require('../config/sequelize');

const voicePlansRepo = new VoicePlansRepository();
const userJourneyRepo = new UserJourneyRepository();
const numberRepo = new NumbersRepository();
const didUserMappingRepo = new DIDUserMappingRepository();
const didAllocateHistoryRepo = new DidAllocateHistoryRepository();


async function createVoicePlans(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};

    const conditions = {
      user_id: req.user.id,
      plan_name: bodyReq.voice_plan.plan_name
    };

    const checkDuplicate = await voicePlansRepo.findOne(conditions);

    if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
      ErrorResponse.message = `Plan Name Already Exists`;
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const rawPlans = bodyReq.voice_plan.plans;

    if (!Array.isArray(rawPlans) || rawPlans.length === 0) {
      ErrorResponse.message = `Plans must be a non-empty array`;
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const updatedPlans = rawPlans.map((plan) => {
      const pulseRupees = Number(plan.pulse_price) / 100;
      const duration = Number(plan?.pulse_duration);
      
      const pricePerSec = duration > 0 ? pulseRupees / duration : 0;

      return {
        pulse_price: Number(plan.pulse_price),
        pulse_duration: Number(plan.pulse_duration),
        plan_type: plan.plan_type,
        price: pricePerSec
      };
    });

    const plan_data = {
      plan_name: bodyReq.voice_plan.plan_name,
      plans: updatedPlans,
      user_id: bodyReq.voice_plan.user_id
    };

    const voice_plan = await voicePlansRepo.create(plan_data);
    responseData.voice_plan = voice_plan;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Voice Plan";

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.VOICE_PLAN,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
    });

    Logger.info(`Voice Plan -> created successfully: ${JSON.stringify(responseData)}`);
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Voice Plan -> unable to create Voice Plan: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "MongoServerError" || error.code === 11000) {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === "DuplicateKey") {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    const data = await voicePlansRepo.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Voice Plan -> retrieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(`Voice Plan -> getAll error: ${JSON.stringify(error)}`);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function updateVoicePlanStatus(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const getVoicePlan = await voicePlansRepo.get(uid);

    if (!getVoicePlan) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Voice Plan not found",
        error: "Not Found",
      });
    }

    if (getVoicePlan.is_allocated == 1) {
      ErrorResponse.message = `Can't change status as Plan is Allocated`;
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const updated = await voicePlansRepo.update(uid, {
      plan_status: bodyReq.status,
    });

    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = { voice_plan: updated };

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.VOICE_PLAN,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    });

    Logger.info(`Voice Plans -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Voice Plans -> unable to update Voice Plan: ${uid}, error: ${JSON.stringify(error)}`
    );

    ErrorResponse.message = error.message || "Something went wrong!";
    ErrorResponse.error = error;

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function updateVoicePlans(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};

    const parentData = await numberRepo.findOneWithVoicePlan({ id: Number(bodyReq.DID) });
    const parentVoicePlanDetailId = parentData?.voice_plan_id

    const ParentVoicePlanDetails = await voicePlansRepo.get(parentVoicePlanDetailId)

    const currentPlanDetail = await voicePlansRepo.findOne({ id: bodyReq?.voice_plan_id });

    if (ParentVoicePlanDetails) {
      for (const plan1 of currentPlanDetail.plans) {
        const match = ParentVoicePlanDetails.plans.find((plan2) => plan2.plan_type === plan1.plan_type);
    
        if (!match) {
          ErrorResponse.message = `No matching parent plan found for "${plan1.plan_type}".`;
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
          };
    
        if (plan1.pulse_price < match.pulse_price) {
          ErrorResponse.message = `Can't allocate pulse price less than parent pulse price for "${plan1.plan_type}".`;
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
    
        if (plan1.pulse_duration < match.pulse_duration) {
          ErrorResponse.message = `Can't allocate pulse duration less than parent duration for "${plan1.plan_type}".`;
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
      }
    }

    numberRepo.update(bodyReq.DID, {voice_plan_id : bodyReq?.voice_plan_id})

    await didAllocateHistoryRepo.create({
      DID: bodyReq.DID,
      from_user: req.user.id,
      to_user: parentData?.allocated_to,
      plan_id: bodyReq?.voice_plan_id,
      action: "UPDATE"
    })

    const mappingDetail = await didUserMappingRepo.findOne({DID: bodyReq.DID})

    const updatedMappingDetails = mappingDetail.mapping_detail.map(item => {
      if (item.voice_plan_id === parentVoicePlanDetailId) {
        return {
          ...item,
          voice_plan_id: bodyReq?.voice_plan_id
        };
      }
      return item;
    });

    didUserMappingRepo.updateVoicePlan({DID: bodyReq.DID}, {mapping_detail : updatedMappingDetails})

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Voice Plan Updated Successfully.";

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.VOICE_PLAN,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
    });

    Logger.info(`Voice Plan -> created successfully: ${JSON.stringify(responseData)}`);
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {

    Logger.error(
      `Voice Plan -> unable to create Voice Plan: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "MongoServerError" || error.code === 11000) {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === "DuplicateKey") {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  getAll,
  createVoicePlans,
  updateVoicePlanStatus,
  updateVoicePlans
};
