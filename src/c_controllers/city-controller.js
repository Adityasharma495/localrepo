const { StatusCodes } = require("http-status-codes");
const { City } = require("country-state-city");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../utils/common");
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");

function getcitiesOfState(req, res) {
  try {
    const { countryCode, stateCode } = req.body;
    if (!countryCode || !stateCode) {
      throw new AppError(
        "Missing Country Code or State Code",
        StatusCodes.BAD_REQUEST
      );
    }

    const states = City.getCitiesOfState(countryCode, stateCode);

    SuccessRespnose.data = states;
    SuccessRespnose.message = "Success";

    Logger.info(`Successfully getting Cities of ${stateCode} State`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `States -> unable to get Cities: ${JSON.stringify(
        req.body
      )} error: ${JSON.stringify(error)}`
    );
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

module.exports = { getcitiesOfState };
