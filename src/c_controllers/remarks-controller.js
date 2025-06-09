const { StatusCodes } = require("http-status-codes");
const {
  RemarksRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { MODULE_LABEL, ACTION_LABEL } = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const remarksRepo = new RemarksRepository();
const userJourneyRepo = new UserJourneyRepository();

async function getAll(req, res) {
    try {
    const data = await remarksRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Remarks -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Remarks -> unable to get Remarks list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function createRemarkStatus(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};

    const updatedData = {
      ...bodyReq,
      agent_id: req.user.id,
      created_by: req.user.id
    }
    
    const remarks = await remarksRepo.create(updatedData);
    responseData.remarks = remarks;

    SuccessRespnose.data = responseData
    SuccessRespnose.message = "Successfully created a new Remarks";

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.REMARKS,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    });

    Logger.info(
      `Remarks -> created successfully: ${JSON.stringify(responseData)}`
    );
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Remarks -> unable to create: ${JSON.stringify(
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


module.exports = {
  getAll,
  createRemarkStatus,
};
