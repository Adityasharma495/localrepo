const { StatusCodes } = require('http-status-codes');

const { ErrorResponse, constants, Helpers, Authentication } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateOperatorCreate(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while trunk crate';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.name == undefined || !bodyReq.name.trim()) {
        ErrorResponse.message = 'Something went wrong while operator create';
        ErrorResponse.error = new AppError(['Name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.type == undefined || !bodyReq.type.trim()) {
        ErrorResponse.message = 'Something went wrong while operator create';
        ErrorResponse.error = new AppError(['Type not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.status == undefined || isNaN(bodyReq.status)) {
        ErrorResponse.message = 'Something went wrong while operator create';
        ErrorResponse.error = new AppError(['Status not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}


function modifyOperatorBodyRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;

        let inputData = {
            operator: {
                name: bodyReq.name.trim(),
                type: bodyReq.type,
                status: Number(bodyReq.status)
            }
        }

        if (is_create) inputData.operator.created_by = req.user.id

        return inputData;

    } catch (error) {

        throw error;

    }

}


function modifyOperatorCreateBodyRequest(req, res, next) {

    try {

        const inputData = modifyOperatorBodyRequest(req);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while creating operator';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}


function modifyOperatorUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyOperatorBodyRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating operator';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Operator';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.operatorIds == undefined || typeof bodyReq.operatorIds !== 'object' || !bodyReq.operatorIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Operator';
        ErrorResponse.error = new AppError(['operatorIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateOperatorCreate,
    modifyOperatorCreateBodyRequest,
    modifyOperatorUpdateBodyRequest,
    validateDeleteRequest
}