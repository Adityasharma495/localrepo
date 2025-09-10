const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const {
  VoiceDialerRepository,
  UserJourneyRepository,
  GroupsDialerMappingRepository,
} = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const {
  MODULE_LABEL,
  ACTION_LABEL,
} = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const smswebhookRepo = new VoiceDialerRepository();
const userJourneyRepo = new UserJourneyRepository();
const groupsDialerMappingRepository = new GroupsDialerMappingRepository();

async function createDialer(req, res) {
  const bodyReq = req.body;

  try {
    bodyReq.created_by = req.user.id;
    const responseData = {};

    const existingWebhook = await smswebhookRepo.findOne({
      dialer_name: bodyReq.dialer_name.trim(),
      created_by: bodyReq.created_by,
    });

    if (existingWebhook) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "Dialer With same name already exists, please choose another name.",
      });
    }

    //   Create webhook with corrected payload
    const webhookData = await smswebhookRepo.create(bodyReq);
    responseData.dialer = webhookData;

    if (bodyReq?.groups) {
      if (bodyReq?.groups?.length > 0) {
        const groupsData = bodyReq.groups;
        const insertPayload = groupsData.map((groupId) => ({
          group_id: groupId,
          dialer_id: webhookData.dialer_id,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await groupsDialerMappingRepository.insertMany(insertPayload);
      }
    }

    //  Add user journey
    const userJourneyfields = {
      module_name: MODULE_LABEL.VOICE_DIALER,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Dialer";

    Logger.info(
      `Voice Dialer -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Voice Dialer -> unable to create dialer: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg =
      error.message || "Something went wrong while creating dialer";

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    const data = await smswebhookRepo.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Voice Dialer -> unable to get dialers list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function get(req, res) {
  const id = req.params.id;

  try {
    const webhookData = await smswebhookRepo.get(id);
    if (webhookData.length == 0) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = webhookData;

    console.log(SuccessRespnose);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Dialers not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Voice Dialers -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteDialer(req, res) {
  const id = req.body.id;

  try {
    const response = await smswebhookRepo.delete(id);

    const userJourneyfields = {
      module_name: MODULE_LABEL.VOICE_DIALER,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Voice Dialers -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Voice Dialers not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Voice Dialers -> unable to delete dialers: ${id}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateDialer(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};

    //  Ensure webhook exists first
    const existingWebhook = await smswebhookRepo.findOne({ dialer_id: uid });
    if (!existingWebhook) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Dialer not found" });
    }

    //  Check if another webhook already exists with same name & created_by
    if (bodyReq.dialer_name) {
      const duplicateWebhook = await smswebhookRepo.findOne({
        dialer_name: bodyReq.dialer_name.trim(),
        created_by: req.user.id,
        dialer_id: { [Op.ne]: uid }, // exclude the current webhook
      });

      if (duplicateWebhook) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message:
            "Voice Dialer with same name already exists, please choose another name.",
        });
      }
    }

    //  Proceed with update
    const webhookData = await smswebhookRepo.update(uid, bodyReq);
    if (!webhookData) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }

    responseData.dialer = webhookData;

    //  Add user journey
    const userJourneyfields = {
      module_name: MODULE_LABEL.VOICE_DIALER,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`Voice Dialer -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "Something went wrong";

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Voice Dialer not found";
    } else if (error.name === "MongoServerError") {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === "DuplicateKey") {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;

    Logger.error(
      `Loation-> unable to update dialer: ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createDialer,
  getAll,
  get,
  deleteDialer,
  updateDialer,
};
