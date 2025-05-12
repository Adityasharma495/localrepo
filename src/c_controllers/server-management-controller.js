const { StatusCodes } = require("http-status-codes");
const {
  ServerManagementRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const AppError = require("../../shared/utils/errors/app-error");
const { Logger } = require("../../shared/config");
const { MODULE_LABEL, ACTION_LABEL } = require("../../shared/utils/common/constants");
const serverManagementRepo = new ServerManagementRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createServerManagement(req, res) {
  const bodyReq = req.body;
  bodyReq.server.data_center_id = Number(bodyReq.server.data_center);
  bodyReq.server.created_by = bodyReq.server.created_by;
  try {
    const responseData = {};
    const server = await serverManagementRepo.create(bodyReq.server);
    responseData.serverManagement = server;

    const userJourneyfields = {
      module_name: MODULE_LABEL.SERVER_MANAGEMENT,
      action: ACTION_LABEL.ADD,
      created_by:  req?.user?.id
    }

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Server";

    Logger.info(
      `Server Management -> created successfully: ${JSON.stringify(
        responseData
      )}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Server Management -> unable to create Server: ${JSON.stringify(
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
    const data = await serverManagementRepo.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Server Management -> unable to get server list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getById(req, res) {
  const id = req.params.id;

  try {
    if (!id) {
      throw new AppError("Missing Data center Id", StatusCodes.BAD_REQUEST);
    }
    const dataCentreData = await serverManagementRepo.get(id);
    if (dataCentreData.length == 0) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = dataCentreData;

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Data Center not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Data Center -> unable to get data center ${id}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateServerManagement(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;
  try {
    const responseData = {};
    const server = await serverManagementRepo.update(uid, bodyReq.server);
    if (!server) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }
    responseData.server = server;

    const userJourneyfields = {
      module_name: MODULE_LABEL.SERVER_MANAGEMENT,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`Server Management -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Server not found";
    } else if (error.name == "MongoServerError") {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == "DuplicateKey")
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Server Management-> unable to update server: ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteServerManagement(req, res) {
  const idArray = req.body.serverIds;

  try {
    const response = await serverManagementRepo.deleteMany(idArray);
    const userJourneyfields = {
      module_name: MODULE_LABEL.SERVER_MANAGEMENT,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Server Management -> ${idArray} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Server not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Server Management -> unable to delete server: ${idArray}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createServerManagement,
  getAll,
  getById,
  updateServerManagement,
  deleteServerManagement,
};
