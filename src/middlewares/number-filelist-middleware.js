const {StatusCodes} = require('http-status-codes');
const { ErrorResponse} = require('../../shared/utils/common');
const AppError = require('../../shared/utils/errors/app-error');

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Number File.';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.fileListIds == undefined || typeof bodyReq.fileListIds !== 'object' || !bodyReq.fileListIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Number File.';
        ErrorResponse.error = new AppError(['fileListIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateDeleteRequest
}