const { StatusCodes } = require("http-status-codes");
const { DataCenterRepository,UserJourneyRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');

const { Logger } = require("../config");

const dataCenterRepo = new DataCenterRepository();
const userJourneyRepo = new UserJourneyRepository();
async function createDataCenter(req, res) {
  const bodyReq = req.body;
  try {
    const responseData = {};
    const dataCenter = await dataCenterRepo.create(bodyReq.data_center);
    responseData.dataCenter = dataCenter;

    const userJourneyfields = {
      module_name: MODULE_LABEL.DATA_CENTER,
      action: ACTION_LABEL.ADD,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new data Center";

    Logger.info(
      `Data Center -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Data Center -> unable to create Data Center: ${JSON.stringify(
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
    const data = await dataCenterRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Data Center -> unable to get data center list, error: ${JSON.stringify(error)}`
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
    const dataCentreData = await dataCenterRepo.get(id);
    if (dataCentreData.length == 0) {
      const error = new Error();
      error.name = 'CastError';
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
      `Data Center -> unable to get data center ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateDataCenter(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;
  try {

    const responseData = {};
    const dataCenter = await dataCenterRepo.update(uid, bodyReq.data_center);
    if (!dataCenter) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    responseData.dataCenter = dataCenter;

    const userJourneyfields = {
      module_name: MODULE_LABEL.DATA_CENTER,
      action: ACTION_LABEL.EDIT,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    Logger.info(`Data Center -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {

    if (error.name == 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = 'Data Center not found';
    }
    else if (error.name == 'MongoServerError') {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(`Data Center-> unable to update Data Center: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);

    return res.status(statusCode).json(ErrorResponse);

  }
}

async function deleteDataCenter(req, res) {
  const idArray = req.body.dataCenterIds;

  try {
    const response = await dataCenterRepo.deleteMany(idArray);

    const userJourneyfields = {
      module_name: MODULE_LABEL.DATA_CENTER,
      action: ACTION_LABEL.DELETE,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Data Center -> ${idArray} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Data center not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Data center -> unable to delete center: ${idArray}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {createDataCenter, getAll, getById, updateDataCenter, deleteDataCenter}