const { StatusCodes } = require('http-status-codes');

const { ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateCreate(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating call centre';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.name == undefined || !bodyReq.name.trim()) {
        ErrorResponse.message = 'Something went wrong while creating call centre';
        ErrorResponse.error = new AppError(['Name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.domain == undefined || !bodyReq.domain.trim()) {
        ErrorResponse.message = 'Something went wrong while creating call centre';
        ErrorResponse.error = new AppError(['Domain not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.description == undefined || !bodyReq.description.trim()) {
        ErrorResponse.message = 'Something went wrong while creating call centre';
        ErrorResponse.error = new AppError(['Description not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.countryCode == undefined || !bodyReq.countryCode.trim()) {
        ErrorResponse.message = 'Something went wrong while creating call centre';
        ErrorResponse.error = new AppError(['Country Code not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.timezone == undefined || !bodyReq.timezone.trim()) {
        ErrorResponse.message = 'Something went wrong while creating call centre';
        ErrorResponse.error = new AppError(['Timezone not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    next();

}

module.exports = {
    validateCreate
}