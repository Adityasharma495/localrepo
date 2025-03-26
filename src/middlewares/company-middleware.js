const { StatusCodes } = require('http-status-codes');
const { constants } = require('../utils/common');
const AppError = require('../utils/errors/app-error');
const ErrorResponse = require('../utils/common/error-response');

const COMPANY_TYPES = constants.COMPANY_TYPES;

function validateCompanyCreate(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Company Create';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!bodyReq.name || !bodyReq.name.trim()) {
        ErrorResponse.message = 'Something went wrong while Company Create';
        ErrorResponse.error = new AppError(['name is required and must be a non-empty string'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!bodyReq.phone || !bodyReq.phone.trim()) {
        ErrorResponse.message = 'Something went wrong while Company Create';
        ErrorResponse.error = new AppError(['phone is required and must be a non-empty string'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!bodyReq.pincode || !bodyReq.pincode.trim()) {
        ErrorResponse.message = 'Something went wrong while Company Create';
        ErrorResponse.error = new AppError(['pincode is required and must be a non-empty string'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!bodyReq.address || !bodyReq.address.trim()) {
        ErrorResponse.message = 'Something went wrong while Company Create';
        ErrorResponse.error = new AppError(['address is required and must be a non-empty string'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.category && !COMPANY_TYPES.includes(bodyReq.category)) {
        ErrorResponse.message = 'Something went wrong while Company Create';
        ErrorResponse.error = new AppError([`category must be one of the following: ${COMPANY_TYPES.join(', ')}`], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!Array.isArray(bodyReq.users) || bodyReq.users.length === 0) {
        ErrorResponse.message = 'Something went wrong while Company Create';
        ErrorResponse.error = new AppError(['users must be a non-empty array of user IDs'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    next();
}

module.exports = {validateCompanyCreate};
