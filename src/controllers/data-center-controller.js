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

    const existingDataCenter = await dataCenterRepo.findOne({
      name: bodyReq.data_center.name,
      is_deleted: false
    });

    if (existingDataCenter) {
      Logger.error(`Data Center -> unable to create: Duplicate Data Center Name Found`);
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = "Duplicate Data Center Name Found. Please use a different name";

      let errorResp = {
        message: errorMsg,
        error: "Data center create request failed"
      };
      return res.status(statusCode).json(errorResp);
    }
      
    const dataCenter = await dataCenterRepo.create(bodyReq.data_center);
    responseData.dataCenter = dataCenter;

    const userJourneyfields = {
      module_name: MODULE_LABEL.DATA_CENTER,
      action: ACTION_LABEL.ADD,
      createdBy: req?.user?.id
    };

    await userJourneyRepo.create(userJourneyfields);

    const SuccessResponse = {
      data: responseData,
      message: "Successfully created a new data center."
    };

    Logger.info(`Data Center -> created successfully: ${JSON.stringify(responseData)}`);
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    Logger.error(`Data Center -> unable to create: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = "Failed to create data center.";

    if (error.name === "MongoServerError" && error.code === 11000) {
      // Extracting the duplicated field and its value from the error object
      const duplicatedField = Object.keys(error.keyValue)[0];
      const duplicatedValue = error.keyValue[duplicatedField];
      // errorMsg = `Duplicate record: ${duplicatedField} ${duplicatedValue} already exists.`;

      errorMsg = "Please use a different name for your data center.";
      statusCode = StatusCodes.BAD_REQUEST;
    }

    const ErrorResponse = {
      message: errorMsg,
      error: error
    };

    return res.status(statusCode).json(ErrorResponse);
  }
}


async function getAll(req, res) {
  try {
    const data = await dataCenterRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Data Center -> recieved all successfully`);

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

    Logger.info(`Data Center -> recieved ${id} successfully`);

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
    const currentData = await dataCenterRepo.getDataCenterById(uid);

    if (currentData.name !== bodyReq.data_center.name) {
        const nameCondition = {
          name: bodyReq.data_center.name,
          is_deleted: false
        };
          
        const nameDuplicate = await dataCenterRepo.findOne(nameCondition);
        if (nameDuplicate) {
          Logger.error(`Data Center -> unable to create: Duplicate Data Center Name Found`);
          var statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
          var errorMsg = "Duplicate Data Center Name Found. Please use a different name";
    
          let errorResp = {
            message: errorMsg,
            error: "Data center update request failed"
          };
          return res.status(statusCode).json(errorResp);
        }
    }
    
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
    var statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    var errorMsg = error.message;

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

    var statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    var errorMsg = error.message;

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