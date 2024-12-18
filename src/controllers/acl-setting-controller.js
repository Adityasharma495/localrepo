const { StatusCodes } = require("http-status-codes");
const { AclSettingRepository, UserJourneyRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const { Logger } = require("../config");
const aclSettingRepo = new AclSettingRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createAclSettings(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};
    const acl_settings = await aclSettingRepo.create(bodyReq.acl_settings);
    responseData.acl_settings = acl_settings;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Acl Settings";

    const userJourneyfields = {
      module_name: MODULE_LABEL.ACL_SETTINGS,
      action: ACTION_LABEL.ADD,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    Logger.info(
      `Acl Settings -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Acl Settings -> unable to create Acl Settings: ${JSON.stringify(
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
    const data = await aclSettingRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Acl Settings -> unable to get Acl Settings list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


async function get(req, res) {
  const id = req.params.id;

  try {
    const aclData = await aclSettingRepo.get(id);
    if (aclData.length == 0) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = aclData;

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Acl Settings not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Acl Settings -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteAclSettings(req, res) {
  const id = req.body.aclIds;

  try {
    const response = await aclSettingRepo.deleteMany(id);

    const userJourneyfields = {
      module_name: MODULE_LABEL.ACL_SETTINGS,
      action: ACTION_LABEL.DELETE,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Acl Settings -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Acl Settings not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Acl Settings -> unable to delete Acl Settings: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}


async function updateAclSettings(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;
  try {

    const responseData = {};
    const acl = await aclSettingRepo.update(uid, bodyReq.acl_settings);
    if (!acl) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    responseData.acl_settings = acl;

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    const userJourneyfields = {
      module_name: MODULE_LABEL.ACL_SETTINGS,
      action: ACTION_LABEL.EDIT,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    Logger.info(`Acl Settings -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {

    if (error.name == 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = 'Acl Settings not found';
    }
    else if (error.name == 'MongoServerError') {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(`Acl Settings-> unable to update Acl Settings: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);

    return res.status(statusCode).json(ErrorResponse);

  }
}

module.exports = {
  getAll,
  createAclSettings,
  get,
  updateAclSettings,
  deleteAclSettings
};
