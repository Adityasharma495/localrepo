const { StatusCodes } = require('http-status-codes');
const {PREFIX_LENGTH} = require('../../shared/utils/common/constants')
const { ErrorResponse} = require('../../shared/utils/common');
const AppError = require('../../shared/utils/errors/app-error');

function validateExtensionCreate(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Extension Create';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.username == undefined || !bodyReq.username.trim()) {
        ErrorResponse.message = 'Something went wrong while Extension Create';
        ErrorResponse.error = new AppError(['username not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.password == undefined || !bodyReq.password.trim()) {
        ErrorResponse.message = 'Something went wrong while Extension Create';
        ErrorResponse.error = new AppError(['password not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.description == undefined || !bodyReq.description.trim()) {
        ErrorResponse.message = 'Something went wrong while Extension Create';
        ErrorResponse.error = new AppError(['description not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.extension == undefined) {
        ErrorResponse.message = 'Something went wrong while Extension Create';
        ErrorResponse.error = new AppError(['extension not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    const extensionStr = bodyReq.extension.toString();
    if (extensionStr.length !== PREFIX_LENGTH) {
        ErrorResponse.message = 'Something went wrong while Extension Create';
        ErrorResponse.error = new AppError([`Prefix length must be exactly ${PREFIX_LENGTH} characters`], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

function modifyExtensionBodyRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;

        let inputData = {
            extension: {
                username: bodyReq.username.trim(),
                password: bodyReq.password.trim(),
                description: bodyReq.description.trim(),
                extension: Number(bodyReq.extension),
            }
        }

        if (is_create) inputData.extension.created_by = req.user.id


        return inputData;

    } catch (error) {

        throw error;

    }

}


function modifyExtensionCreateBodyRequest(req, res, next) {

    try {

        const inputData = modifyExtensionBodyRequest(req);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while creating Extension';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}


function modifyExtensionUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyExtensionBodyRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Extension';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Extension';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.extensionIds == undefined || typeof bodyReq.extensionIds !== 'object' || !bodyReq.extensionIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Extension';
        ErrorResponse.error = new AppError(['extensionIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateExtensionCreate,
    modifyExtensionCreateBodyRequest,
    modifyExtensionUpdateBodyRequest,
    validateDeleteRequest
}