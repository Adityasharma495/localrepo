const { StatusCodes } = require("http-status-codes");
const { State} = require('country-state-city');
const {
    SuccessRespnose,
    ErrorResponse,
  } = require("../utils/common");
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");

function getStatesOfCountry(req, res) {
   try {
    const {countryCode} = req.body
    if (!countryCode) {
        throw new AppError("Missing Country Code", StatusCodes.BAD_REQUEST);
    }
    
    const states = State.getStatesOfCountry(countryCode);

    SuccessRespnose.data = states;
    SuccessRespnose.message = "Success";

    Logger.info(`Successfully getting states of ${countryCode} Country`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);

   } catch (error) {
    Logger.error(
      `States -> unable to get states: ${JSON.stringify(
        req.body
      )} error: ${JSON.stringify(error)}`
    );
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}  

module.exports = {getStatesOfCountry}