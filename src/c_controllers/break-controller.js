const { StatusCodes } = require("http-status-codes");
const {
  BreakRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const {
  MODULE_LABEL,
  ACTION_LABEL,
} = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const breakRepo = new BreakRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createBreak(req, res) {
  const bodyReq = req.body;
  try {
    bodyReq.created_by = req.user.id;
    const responseData = {};

    // Create break with corrected payload
    const breakData = await breakRepo.create(bodyReq);
    responseData.break = breakData;

    const userJourneyfields = {
      module_name: MODULE_LABEL.BREAK,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new break";

    Logger.info(
      `Break -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Break -> unable to create break: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    const data = await breakRepo.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Break -> unable to get break list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function get(req, res) {
  const id = req.params.id;

  try {
    const breakData = await breakRepo.get(id);
    if (breakData.length == 0) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = breakData;

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Break not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `User -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteBreak(req, res) {
  const id = req.body.id;

  try {
    const response = await breakRepo.delete(id);

    const userJourneyfields = {
      module_name: MODULE_LABEL.BREAK,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Break -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Break not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Break -> unable to delete break: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateBreak(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};

    const breakData = await breakRepo.update(uid, bodyReq);
    if (!breakData) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }

    responseData.break = breakData;

    const userJourneyfields = {
      module_name: MODULE_LABEL.BREAK,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`Break -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "Something went wrong";

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Break not found";
    } else if (error.name === "MongoServerError") {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === "DuplicateKey") {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;

    Logger.error(
      `Break-> unable to update break: ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createBreak,
  getAll,
  get,
  deleteBreak,
  updateBreak,
};
