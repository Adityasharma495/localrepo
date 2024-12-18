const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateCreate(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating company';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.name == undefined || !bodyReq.name.trim()) {
        ErrorResponse.message = 'Something went wrong while creating company';
        ErrorResponse.error = new AppError(['name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.code == undefined || !bodyReq.code.trim()) {
        ErrorResponse.message = 'Something went wrong while creating company';
        ErrorResponse.error = new AppError(['code not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.calling_code == undefined || !bodyReq.calling_code.trim()) {
        ErrorResponse.message = 'Something went wrong while creating company';
        ErrorResponse.error = new AppError(['calling_code not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    next();

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting CountryCode';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.countryCodeIds == undefined || typeof bodyReq.countryCodeIds !== 'object' || !bodyReq.countryCodeIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting CountryCode';
        ErrorResponse.error = new AppError(['countryCodeIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}




module.exports = {
    validateCreate,
    validateDeleteRequest
}