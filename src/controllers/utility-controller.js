const { StatusCodes } = require("http-status-codes");
const { TimezoneRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse } = require("../utils/common");

const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");

const timezoneRepo = new TimezoneRepository();

async function getAllTimezones(req, res) {
  
    try {

        const data = await timezoneRepo.getAll();
        SuccessRespnose.data = data;
        SuccessRespnose.message = "Success";

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        
        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(
            `Timezones -> unable to get timezone list, error: ${JSON.stringify(error)}`
        );

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    
    }

}

module.exports = {
    getAllTimezones
}
