const { StatusCodes } = require("http-status-codes");
const {
  RemarkStatusRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { Op } = require("sequelize");
const { MODULE_LABEL, ACTION_LABEL, USERS_ROLE } = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const remarkStatusRepo = new RemarkStatusRepository();
const userJourneyRepo = new UserJourneyRepository();

async function getAll(req, res) {
    try {
    const data = await remarkStatusRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Remark Status -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Remark Status -> unable to get Remark Status list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function createRemarkStatus(req, res) {
  const bodyReq = req.body;
  console.log('bodyReq', bodyReq)

  try {
    const responseData = {};

    const existingRemarkStatus = await remarkStatusRepo.findOne({ remark: bodyReq?.remark_status?.remark, created_by: req.user.id , is_deleted: false});
    if (existingRemarkStatus) {
      ErrorResponse.message = 'Remark Status With Same Remark Already Exists.';
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }

    const remark_status = await remarkStatusRepo.create(bodyReq.remark_status);
    responseData.remark_status = remark_status;

    SuccessRespnose.data = responseData
    SuccessRespnose.message = "Successfully created a new Remark Status";

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.REMARK_STATUS,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    });

    Logger.info(
      `Remark Status -> created successfully: ${JSON.stringify(responseData)}`
    );
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Remark Status -> unable to create: ${JSON.stringify(
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
    const remarkStatus = await remarkStatusRepo.findOne({ id: id });

    if (!remarkStatus) {
      const error = new Error("Remark Status not found");
      error.name = "CastError";
      throw error;
    }

    SuccessRespnose.message = "Success";
    SuccessRespnose.data = remarkStatus

    Logger.info(`Remark Status -> received successfully`);
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
      `Remark Status -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteRemarkStatus(req, res) {
  const ids = req.body.remarkStatusIds;

  try {
    const response = await remarkStatusRepo.deleteMany(ids);

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.REMARK_STATUS,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    });

    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = { deletedCount: response };

    Logger.info(`Remark Status -> ${ids} deleted successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log("error", error);
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Remark Status not found";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(
      `Remark Status -> unable to delete: ${ids}, error: ${JSON.stringify(
        error
      )}`
    );
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateRemarkStatus(req, res) {
  const id = req.params.id;
  const bodyReq = req.body.remark_status;

  try {
    const existingAcl = await remarkStatusRepo.findOne({
      created_by: req.user.id,
      id: { [Op.ne]: id },
      remark: req.body.remark_status.remark,
      is_deleted: false
    });
    
    if (existingAcl) {
      ErrorResponse.message = 'Remark Status With Same Name Already Exists.';
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }

    const updatedRecord = await remarkStatusRepo.update(id, bodyReq);

    if (!updatedRecord) {
      const error = new Error("Remark Status not found");
      error.name = "CastError";
      throw error;
    }

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.REMARK_STATUS,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    });

    const successRes = {
      ...SuccessRespnose,
      message: "Updated successfully!",
      data: { remark_status: updatedRecord },
    };

    Logger.info(`Remark Status -> ${id} updated successfully`);
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

    Logger.error(`Remark Status -> unable to update: ${id}, error: ${errorMsg}`);
    return res.status(statusCode).json(errorRes);
  }
}


module.exports = {
  getAll,
  createRemarkStatus,
  get,
  updateRemarkStatus,
  deleteRemarkStatus,
};
