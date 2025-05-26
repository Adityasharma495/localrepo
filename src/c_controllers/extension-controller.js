const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const {
  ExtensionRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");

const {SubscriberRepository} = require("../../shared/c_repositories")
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const AppError = require("../../shared/utils/errors/app-error");
const {
  BACKEND_BASE_URL,
  MODULE_LABEL,
  ACTION_LABEL,
} = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const extensionRepo = new ExtensionRepository();
const userJourneyRepo = new UserJourneyRepository();
const subscriberRepo = new SubscriberRepository();


async function createExtension(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};
    const conditions = {
      [Op.or]: [
        { extension: bodyReq.extension.extension },
        { username: bodyReq.extension.username },
      ],
      created_by: req.user.id,
    };

    const checkDuplicate = await extensionRepo.findOne(conditions);

    if (checkDuplicate) {
      const duplicateField =
        checkDuplicate.extension == bodyReq.extension.extension
          ? "Extension"
          : "Username";

      ErrorResponse.message = `${duplicateField} Already Exists`;
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const extension = await extensionRepo.create({
      ...bodyReq.extension,
      created_by: req.user.id,
    });
    responseData.extension = extension;

    await subscriberRepo.addSubscriber({
      username: bodyReq.extension.extension,
      domain: BACKEND_BASE_URL,
      password: bodyReq.extension.password,
    });

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.EXTENSION,
      action: ACTION_LABEL.ADD,
      created_by: req.user.id,
    });

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Extension";

    Logger.info(
      `Extension -> created successfully: ${JSON.stringify(responseData)}`
    );
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(`Extension -> create failed: ${JSON.stringify(error)}`);

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "SequelizeUniqueConstraintError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Duplicate key, record already exists.";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    const extensionData = await extensionRepo.getAll(
      req.user.id,
      req.query?.data
    );

    SuccessRespnose.data = extensionData;
    SuccessRespnose.message = "Success";

    Logger.info(`Extension -> received all successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    Logger.error(`Extension -> getAll error: ${JSON.stringify(error)}`);

    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
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
    if (!extensionData) {
      throw new AppError("Extension not found", StatusCodes.BAD_REQUEST);
    }

    SuccessRespnose.message = "Success";
    SuccessRespnose.data = extensionData;

    Logger.info(`Extension -> received ${id} successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    Logger.error(`Extension -> getById error: ${JSON.stringify(error)}`);

    ErrorResponse.error = error;
    ErrorResponse.message = error.message || "Error retrieving extension";
    const statusCode =
      error instanceof AppError
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateExtension(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};
    const currentData = await extensionRepo.get(uid);

    if (!currentData) {
      throw new AppError("Extension not found", StatusCodes.BAD_REQUEST);
    }

    if (currentData.extension !== bodyReq.extension.extension) {
      const duplicate = await extensionRepo.findOne({
        where: {
          extension: bodyReq.extension.extension,
          created_by: req.user.id,
        },
      });
      if (duplicate) {
        ErrorResponse.message = "Extension already exists";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }

    if (currentData.username !== bodyReq.extension.username) {
      const duplicate = await extensionRepo.findOne({
        where: {
          username: bodyReq.extension.username,
          created_by: req.user.id,
        },
      });
      if (duplicate) {
        ErrorResponse.message = "Username already exists";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }

    const extension = await extensionRepo.update(uid, bodyReq.extension);
    if (!extension) {
      throw new AppError("Extension not found", StatusCodes.BAD_REQUEST);
    }

    await subscriberRepo.addSubscriber({
      username: bodyReq.extension.extension,
      domain: BACKEND_BASE_URL,
      password: bodyReq.extension.password,
    });

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.EXTENSION,
      action: ACTION_LABEL.EDIT,
      created_by: req.user.id,
    });

    responseData.extension = extension;
    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`Extension -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    Logger.error(`Extension -> update failed: ${JSON.stringify(error)}`);

    ErrorResponse.message = error.message || "Update failed";
    ErrorResponse.error = error;
    const statusCode =
      error instanceof AppError
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteExtension(req, res) {
  const ids = req.body.extensionIds;
  try {
    const allocatedExtensions = await extensionRepo.find({
      where: {
        id: { [Op.in]: ids },
        is_allocated: 1,
      },
    });

    if (allocatedExtensions) {
      const allocatedUsernames = allocatedExtensions
        .map((ext) => ext.username)
        .join(", ");
      throw new AppError(
        `Cannot delete these extensions as they are allocated: ${allocatedUsernames}`,
        StatusCodes.BAD_REQUEST
      );
    }

    const response = await extensionRepo.deleteMany(ids);

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.EXTENSION,
      action: ACTION_LABEL.DELETE,
      created_by: req.user.id,
    });

    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Extension -> ${ids} deleted successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    Logger.error(`Extension -> delete failed: ${JSON.stringify(error)}`);

    ErrorResponse.error = error;
    ErrorResponse.message = error.message || "Error deleting extensions";

    const statusCode =
      error instanceof AppError
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createExtension,
  getAll,
  getById,
  updateExtension,
  deleteExtension,
};
