const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const {
  SMSWebhookRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const {
  MODULE_LABEL,
  ACTION_LABEL,
} = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const smswebhookRepo = new SMSWebhookRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createSmsWebhook(req, res) {
  const bodyReq = req.body;
  try {
    bodyReq.created_by = req.user.id;
    const responseData = {};

    //   Check if webhook with same name already exists for this user
    const existingWebhook = await smswebhookRepo.findOne({
      webhook_name: bodyReq.webhook_name.trim(),
      created_by: bodyReq.created_by,
    });

    if (existingWebhook) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Sms Webhook name already exists, please choose another name.",
      });
    }

    //   Create webhook with corrected payload
    const webhookData = await smswebhookRepo.create(bodyReq);
    responseData.webhook = webhookData;

    //  Add user journey
    const userJourneyfields = {
      module_name: MODULE_LABEL.SMS_WEBHOOK,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new sms webhook";

    Logger.info(
      `Sms Webhook -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    console.log("errorr", error);
    Logger.error(
      `Sms Webhook -> unable to create webhook: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg =
      error.message || "Something went wrong while creating sms webhook";

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
      `Sms Webhook -> unable to get sms webhook list, error: ${JSON.stringify(error)}`
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

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Sms Webhook not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Sms Webhook -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteSmsWebhook(req, res) {
  const id = req.body.id;

  try {
    const response = await smswebhookRepo.delete(id);

    const userJourneyfields = {
      module_name: MODULE_LABEL.SMS_WEBHOOK,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Sms Webhook -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Sms Webhook not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Sms Webhook -> unable to delete sms Webhook: ${id}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateSmsWebhook(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};

    //  Ensure webhook exists first
    const existingWebhook = await smswebhookRepo.findOne({ id: uid });
    if (!existingWebhook) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Sms Webhook not found" });
    }

    //  Check if another webhook already exists with same name & created_by
    if (bodyReq.webhook_name) {
      const duplicateWebhook = await smswebhookRepo.findOne({
          webhook_name: bodyReq.webhook_name.trim(),
          created_by: req.user.id,
          id: { [Op.ne]: uid }, // exclude the current webhook
      });

      if (duplicateWebhook) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Sms Webhook name already exists, please choose another name.",
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

    responseData.webhook = webhookData;

    //  Add user journey
    const userJourneyfields = {
      module_name: MODULE_LABEL.SMS_WEBHOOK,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`Sms Webhook -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "Something went wrong";

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Sms Webhook not found";
    } else if (error.name === "MongoServerError") {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === "DuplicateKey") {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;

    Logger.error(
      `Sms Webhook-> unable to update webhook: ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createSmsWebhook,
  getAll,
  get,
  deleteSmsWebhook,
  updateSmsWebhook,
};
