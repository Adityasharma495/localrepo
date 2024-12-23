const { StatusCodes } = require('http-status-codes');
const { LanguageRepository } = require('../repositories');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const { Logger } = require('../config');

const languageRepo = new LanguageRepository();

async function getAll(req, res){

    try {

        const response = await languageRepo.getAll();

        SuccessRespnose.message = "Success";
        SuccessRespnose.data = response;

        return res.status(StatusCodes.OK).json(SuccessRespnose);
        
    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Language -> unable to get Languages list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        
    }

}


module.exports = {
    getAll
};