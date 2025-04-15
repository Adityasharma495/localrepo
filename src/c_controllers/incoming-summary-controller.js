const { StatusCodes } = require("http-status-codes");
const {
  SuccessRespnose,
  ErrorResponse,
  ResponseFormatter,
} = require("../utils/common");
const { Logger } = require("../config");
const { IncomingSummaryRepository } = require("../c_repositories");
const incomingSummaryRepo = new IncomingSummaryRepository();
const version = process.env.API_V || "1";

// const { constants } = require("../utils/common");

async function getAll(req, res) {
  try {
    // const data = await incomingSummaryRepo.getAll(constants.USERS_ROLE.SUPER_ADMIN, req.user.id);
    const data = await incomingSummaryRepo.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(data, version);
    SuccessRespnose.message = "Success";

    Logger.info(`Incoming Summary -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Incoming Summary -> unable to get Incoming Summary list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  getAll,
};
