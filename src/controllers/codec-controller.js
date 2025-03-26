const { StatusCodes } = require('http-status-codes');
const { CodecRepository } = require('../repositories');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const { Logger } = require('../config');
const AppError = require('../utils/errors/app-error');

const codecRepo = new CodecRepository();

async function getAll(req, res){

    try {

        const response = await codecRepo.getAll();

        SuccessRespnose.message = "Success";
        SuccessRespnose.data = response;

        Logger.info(`User -> recieved all codecs list`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);
        
    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`User -> unable to get codecs list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        
    }

}


module.exports = {
    getAll
};