const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const {
  LocationsRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const {
  MODULE_LABEL,
  ACTION_LABEL,
} = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const smswebhookRepo = new LocationsRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createLocation(req, res) {
  const bodyReq = req.body;
  try {
    bodyReq.created_by = req.user.id;
    const responseData = {};

    const existingWebhook = await smswebhookRepo.findOne({
      location_name: bodyReq.location_name.trim().toLowerCase(),
      created_by: bodyReq.created_by,
    });

    if (existingWebhook) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "Location With same name already exists, please choose another name.",
      });
    }

    //   Create webhook with corrected payload
    const webhookData = await smswebhookRepo.create(bodyReq);
    responseData.location = webhookData;

    //  Add user journey
    const userJourneyfields = {
      module_name: MODULE_LABEL.LOCATION,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Location";

    Logger.info(
      `Location -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Location -> unable to create location: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "Something went wrong while creating location";

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
      `Location -> unable to get locations list, error: ${JSON.stringify(error)}`
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
      errorMsg = "Location not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Location -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteLocation(req, res) {
  const id = req.body.id;

  try {
    const response = await smswebhookRepo.delete(id);

    const userJourneyfields = {
      module_name: MODULE_LABEL.LOCATION,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Location -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Location not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Location -> unable to delete location: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateLocation(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};

    //  Ensure webhook exists first
    const existingWebhook = await smswebhookRepo.findOne({ id: uid });
    if (!existingWebhook) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Location not found" });
    }

    //  Check if another webhook already exists with same name & created_by
    if (bodyReq.location_name) {
      const duplicateWebhook = await smswebhookRepo.findOne({
        location_name: bodyReq.location_name.trim().toLowerCase(),
        created_by: req.user.id,
        id: { [Op.ne]: uid }, // exclude the current webhook
      });

      if (duplicateWebhook) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message:
            "Location with same name already exists, please choose another name.",
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

    responseData.location = webhookData;

    //  Add user journey
    const userJourneyfields = {
      module_name: MODULE_LABEL.LOCATION,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`Location -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "Something went wrong";

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Location not found";
    } else if (error.name === "MongoServerError") {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === "DuplicateKey") {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;

    Logger.error(
      `Loation-> unable to update location: ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createLocation,
  getAll,
  get,
  deleteLocation,
  updateLocation,
};
