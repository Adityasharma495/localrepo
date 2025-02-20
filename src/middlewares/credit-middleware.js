const {StatusCodes} = require('http-status-codes');
const { ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateUpdateRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Updating User Credits.';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.id == undefined || bodyReq.action == undefined) {
        ErrorResponse.message = 'Something went wrong while Updating User Credits.';
        ErrorResponse.error = new AppError(['fileListIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateUpdateRequest
}