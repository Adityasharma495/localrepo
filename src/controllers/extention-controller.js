const { StatusCodes } = require("http-status-codes");
const { ExtentionRepository, UserJourneyRepository, AgentGroupMappingRepository, AgentGroupRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const AppError = require("../utils/errors/app-error");

const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');

const { Logger } = require("../config");

const extentionRepo = new ExtentionRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createExtention(req, res) {
  const bodyReq = req.body;
  try {
    const responseData = {}
    const conditions = {
      created_by: req.user.id,
      $or: [
        { extention: bodyReq.extention.extention },
        { username: bodyReq.extention.username}
      ]
    };
    const checkDuplicate = await extentionRepo.findOne(conditions);
    
    if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
      const duplicateField = checkDuplicate.extention === bodyReq.extention.extention ? 'Extention' : 'Username';
      ErrorResponse.message = `${duplicateField} Already Exists`;
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    const extention = await extentionRepo.create(bodyReq.extention);
    responseData.extention = extention;

    const userJourneyfields = {
      module_name: MODULE_LABEL.EXTENTION,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Extention";

    Logger.info(
      `Extention -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Extention -> unable to create Extention: ${JSON.stringify(
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
    const extentionData = await extentionRepo.getAll(req.user.id, data);
    SuccessRespnose.data = extentionData;
    SuccessRespnose.message = "Success";

    Logger.info(
      `Extention -> recieved all successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Extention -> unable to get Extentions list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getById(req, res) {
  const id = req.params.id;

  try {
    if (!id) {
      throw new AppError("Missing Extention Id", StatusCodes.BAD_REQUEST);
     }
    const extentionData = await extentionRepo.get(id);
    if (extentionData.length == 0) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = extentionData;

    Logger.info(
      `Extention -> recieved ${id} successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Extention not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Extention -> unable to get Extention ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateExtention(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;
  try {

    const responseData = {};
    const currentData = await extentionRepo.get(uid);

    if (currentData.extention !== bodyReq.extention.extention) {
      const extentionCondition = {
        created_by: req.user.id,
        extention: bodyReq.extention.extention
      };
      const extentionDuplicate = await extentionRepo.findOne(extentionCondition);
      if (extentionDuplicate) {
        ErrorResponse.message = 'Extention already exists';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }

    // Check for duplicate username if it is being changed
    if (currentData.username !== bodyReq.extention.username) {
      const nameCondition = {
        created_by: req.user.id,
        username: bodyReq.extention.username
      };
      const nameDuplicate = await extentionRepo.findOne(nameCondition);
      if (nameDuplicate) {
        ErrorResponse.message = 'Username already exists';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }
    const extention = await extentionRepo.update(uid, bodyReq.extention);
    if (!extention) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    responseData.extention = extention;
    const userJourneyfields = {
      module_name: MODULE_LABEL.EXTENTION,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    Logger.info(`Extention -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode
    if (error.name == 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = 'Extention not found';
    }
    else if (error.name == 'MongoServerError') {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(`Extention-> unable to update Extention: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);

    return res.status(statusCode).json(ErrorResponse);

  }
}

async function deleteExtention(req, res) {
  const id = req.body.extentionIds;

  try {
     // Check if any of the extensions have isAllocated: 1
     const allocatedExtensions = await extentionRepo.find({
      _id: { $in: id },
      isAllocated: 1,
    });

    if (allocatedExtensions.length > 0) {
      const allocatedIds = allocatedExtensions.map((ext) => ext.username).join(", ");
      throw new Error(`Cannot delete these extensions as they are allocated: ${allocatedIds}`);
    }

    const response = await extentionRepo.deleteMany(id);
    
    const userJourneyfields = {
      module_name: MODULE_LABEL.EXTENTION,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Extention -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Extention not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Extention -> unable to delete Extention: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {createExtention, getAll, getById, updateExtention, deleteExtention}