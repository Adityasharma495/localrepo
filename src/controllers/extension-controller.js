const { StatusCodes } = require("http-status-codes");
const { ExtensionRepository, UserJourneyRepository, SubscriberRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const {BACKEND_BASE_URL} = require('../utils/common/constants');
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');

const { Logger } = require("../config");

const extensionRepo = new ExtensionRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createExtension(req, res) {
  const bodyReq = req.body;
  try {
    const responseData = {}
    const conditions = {
      created_by: req.user.id,
      $or: [
        { extension: bodyReq.extension.extension },
        { username: bodyReq.extension.username}
      ]
    };
    const checkDuplicate = await extensionRepo.findOne(conditions);
    
    if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
      const duplicateField = checkDuplicate.extension === bodyReq.extension.extension ? 'Extension' : 'Username';
      ErrorResponse.message = `${duplicateField} Already Exists`;
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    const extension = await extensionRepo.create(bodyReq.extension);
    responseData.extension = extension;

    // entry to subscriber
    await SubscriberRepository.addSubscriber({
      username: bodyReq.extension.extension,
      domain: BACKEND_BASE_URL,
      password:bodyReq.extension.password,
    })

    const userJourneyfields = {
      module_name: MODULE_LABEL.EXTENSION,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Extension";

    Logger.info(
      `Extension -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Extension -> unable to create Extension: ${JSON.stringify(
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
    const extensionData = await extensionRepo.getAll(req.user.id, data);
    SuccessRespnose.data = extensionData;
    SuccessRespnose.message = "Success";

    Logger.info(
      `Extension -> recieved all successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Extension -> unable to get Extensions list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getById(req, res) {
  const id = req.params.id;

  try {
    if (!id) {
      throw new AppError("Missing Extension Id", StatusCodes.BAD_REQUEST);
     }
    const extensionData = await extensionRepo.get(id);
    if (extensionData.length == 0) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = extensionData;

    Logger.info(
      `Extension -> recieved ${id} successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Extension not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Extension -> unable to get Extension ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateExtension(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;
  try {

    const responseData = {};
    const currentData = await extensionRepo.get(uid);

    if (currentData.extension !== bodyReq.extension.extension) {
      const extensionCondition = {
        created_by: req.user.id,
        extension: bodyReq.extension.extension
      };
      const extensionDuplicate = await extensionRepo.findOne(extensionCondition);
      if (extensionDuplicate) {
        ErrorResponse.message = 'Extension already exists';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }

    // Check for duplicate username if it is being changed
    if (currentData.username !== bodyReq.extension.username) {
      const nameCondition = {
        created_by: req.user.id,
        username: bodyReq.extension.username
      };
      const nameDuplicate = await extensionRepo.findOne(nameCondition);
      if (nameDuplicate) {
        ErrorResponse.message = 'Username already exists';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }
    const extension = await extensionRepo.update(uid, bodyReq.extension);

     // update subscriber
     await SubscriberRepository.addSubscriber({
      username: bodyReq.extension.extension,
      domain: BACKEND_BASE_URL,
      password:bodyReq.extension.password,
    })
    
    if (!extension) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    responseData.extension = extension;
    const userJourneyfields = {
      module_name: MODULE_LABEL.EXTENSION,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    Logger.info(`Extension -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode
    if (error.name == 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = 'Extension not found';
    }
    else if (error.name == 'MongoServerError') {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(`Extension-> unable to update Extension: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);

    return res.status(statusCode).json(ErrorResponse);

  }
}

async function deleteExtension(req, res) {
  const id = req.body.extensionIds;

  try {
     // Check if any of the extensions have is_allocated: 1
     const allocatedExtensions = await extensionRepo.find({
      _id: { $in: id },
      is_allocated: 1,
    });

    if (allocatedExtensions.length > 0) {
      const allocatedIds = allocatedExtensions.map((ext) => ext.username).join(", ");
      throw new Error(`Cannot delete these extensions as they are allocated: ${allocatedIds}`);
    }

    const response = await extensionRepo.deleteMany(id);
    
    const userJourneyfields = {
      module_name: MODULE_LABEL.EXTENSION,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Extension -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Extension not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Extension -> unable to delete Extension: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {createExtension, getAll, getById, updateExtension, deleteExtension}