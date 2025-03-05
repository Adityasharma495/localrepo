const { StatusCodes } = require('http-status-codes');
const {PREFIX_LENGTH} = require('../utils/common/constants')
const { ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateExtentionCreate(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Extention Create';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.username == undefined || !bodyReq.username.trim()) {
        ErrorResponse.message = 'Something went wrong while Extention Create';
        ErrorResponse.error = new AppError(['username not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.password == undefined || !bodyReq.password.trim()) {
        ErrorResponse.message = 'Something went wrong while Extention Create';
        ErrorResponse.error = new AppError(['password not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.description == undefined || !bodyReq.description.trim()) {
        ErrorResponse.message = 'Something went wrong while Extention Create';
        ErrorResponse.error = new AppError(['description not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.extention == undefined) {
        ErrorResponse.message = 'Something went wrong while Extention Create';
        ErrorResponse.error = new AppError(['extention not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    const extentionStr = bodyReq.extention.toString();
    if (extentionStr.length !== PREFIX_LENGTH) {
        ErrorResponse.message = 'Something went wrong while Extention Create';
        ErrorResponse.error = new AppError([`Prefix length must be exactly ${PREFIX_LENGTH} characters`], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

function modifyExtentionBodyRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;

        let inputData = {
            extention: {
                username: bodyReq.username.trim(),
                password: bodyReq.password.trim(),
                description: bodyReq.description.trim(),
                extention: Number(bodyReq.extention),
            }
        }

        if (is_create) inputData.extention.created_by = req.user.id


        return inputData;

    } catch (error) {

        throw error;

    }

}


function modifyExtentionCreateBodyRequest(req, res, next) {

    try {

        const inputData = modifyExtentionBodyRequest(req);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while creating Extention';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}


function modifyExtentionUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyExtentionBodyRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Extention';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Extention';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.extentionIds == undefined || typeof bodyReq.extentionIds !== 'object' || !bodyReq.extentionIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Extention';
        ErrorResponse.error = new AppError(['extentionIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateExtentionCreate,
    modifyExtentionCreateBodyRequest,
    modifyExtentionUpdateBodyRequest,
    validateDeleteRequest
}