const { StatusCodes } = require("http-status-codes");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");
const { IncomingSummaryRepository } = require("../../shared/c_repositories");
const incomingSummaryRepo = new IncomingSummaryRepository();

const { constants } = require("../../shared/utils/common");

async function getAll(req, res) {

  try {

    console.log("REQUESR ID", req.user.id);

    
    const data = await incomingSummaryRepo.getAll(req.user.role, req.user.id);

    SuccessRespnose.data = data;
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


async function getByDateRange(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "startDate and endDate are required in query params",
      });
    }
    
    const data = await incomingSummaryRepo.getByDateRange(
      req.user.role,
      req.user.id,
      startDate,
      endDate
    );

    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(
      `Incoming Summary -> retrieved data for range ${startDate} to ${endDate}`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Incoming Summary -> unable to get range data, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  getAll,
  getByDateRange
};
