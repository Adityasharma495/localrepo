const { StatusCodes } = require("http-status-codes");
const { TimezoneRepository } = require("../c_repositories");
const {
  SuccessRespnose,
  ErrorResponse,
  ResponseFormatter,
} = require("../utils/common");

const { Logger } = require("../config");
const version = process.env.API_V || "1";

const timezoneRepo = new TimezoneRepository();

async function getAllTimezones(req, res) {
  try {
    const data = await timezoneRepo.getAll();
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(data, version);
    SuccessRespnose.message = "Success";

    Logger.info(`Timezones -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Timezones -> unable to get timezone list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  getAllTimezones,
};
