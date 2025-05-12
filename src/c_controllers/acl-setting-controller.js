const { StatusCodes } = require("http-status-codes");
const {
  AclSettingsRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { MODULE_LABEL, ACTION_LABEL, USERS_ROLE } = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const aclSettingRepo = new AclSettingsRepository();
const userJourneyRepo = new UserJourneyRepository();

async function getAll(req, res) {
    try {
    const data = await aclSettingRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Acl Settings -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Acl Settings -> unable to get Acl Settings list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function createAclSettings(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};

    const acl_settings = await aclSettingRepo.create(bodyReq.acl_settings);
    responseData.acl_settings = acl_settings;

    SuccessRespnose.data = responseData
    SuccessRespnose.message = "Successfully created a new Acl Settings";

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.ACL_SETTINGS,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    });

    Logger.info(
      `Acl Settings -> created successfully: ${JSON.stringify(responseData)}`
    );
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Acl Settings -> unable to create: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "SequelizeUniqueConstraintError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = `Duplicate key, record already exists for ${Object.keys(
        error.fields
      ).join(", ")}`;
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function get(req, res) {
  const id = req.params.id;

  try {
    const aclData = await aclSettingRepo.findOne({ id: id });

    if (!aclData) {
      const error = new Error("Acl Settings not found");
      error.name = "CastError";
      throw error;
    }

    SuccessRespnose.message = "Success";
    SuccessRespnose.data = aclData

    Logger.info(`Acl Settings -> received successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log("error", error);
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(
      `Acl Settings -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteAclSettings(req, res) {
  const ids = req.body.aclIds;

  try {
    const response = await aclSettingRepo.deleteMany(ids);

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.ACL_SETTINGS,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    });

    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = { deletedCount: response };

    Logger.info(`Acl Settings -> ${ids} deleted successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log("error", error);
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Acl Settings not found";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(
      `Acl Settings -> unable to delete: ${ids}, error: ${JSON.stringify(
        error
      )}`
    );
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateAclSettings(req, res) {
  const id = req.params.id;
  const { acl_name, module_operations } = req.body.acl_settings;

  try {
    const updateData = {
      acl_name,
      module_operations: typeof module_operations === 'string' 
        ? module_operations 
        : JSON.stringify(module_operations),
    };

    const updatedRecord = await aclSettingRepo.update(id, updateData);

    if (!updatedRecord) {
      const error = new Error("Acl Settings not found");
      error.name = "CastError";
      throw error;
    }

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.ACL_SETTINGS,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    });

    const successRes = {
      ...SuccessRespnose,
      message: "Updated successfully!",
      data: { acl_settings: updatedRecord },
    };

    Logger.info(`Acl Settings -> ${id} updated successfully`);
    return res.status(StatusCodes.OK).json(successRes);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (error.name === "SequelizeUniqueConstraintError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = `Duplicate key, record already exists for ${Object.keys(error.fields).join(", ")}`;
    }

    const errorRes = {
      ...ErrorResponse,
      message: errorMsg,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    };

    Logger.error(`Acl Settings -> unable to update: ${id}, error: ${errorMsg}`);
    return res.status(statusCode).json(errorRes);
  }
}


module.exports = {
  getAll,
  createAclSettings,
  get,
  updateAclSettings,
  deleteAclSettings,
};
