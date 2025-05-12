const { StatusCodes } = require('http-status-codes');
const { ErrorResponse, constants } = require('../../shared/utils/common');
const AppError = require('../../shared/utils/errors/app-error');

function validateRemoveDidHostoryRequest(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Remove DID History';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.did == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Remove DID History';
        ErrorResponse.error = new AppError(['did not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.remove_from == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Remove DID History';
        ErrorResponse.error = new AppError(['from_user not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.remove_by == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Remove DID History';
        ErrorResponse.error = new AppError(['to_user not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.plan_id == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Remove DID History';
        ErrorResponse.error = new AppError(['plan_id not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.action == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Remove DID History';
        ErrorResponse.error = new AppError(['action not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();

}

function modifyRemoveDidHostoryCreateBodyRequest (req, res, next) {
    try {

        const inputData = modifyRemoveDidHostoryRequest(req);

        req.body = inputData;
        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating Remove DID History';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

function modifyRemoveDidHostoryRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            did_remove: {
                did: bodyReq.did.trim(),
                remove_from: bodyReq.remove_from,
                remove_by: bodyReq.remove_by,
                plan_id: bodyReq.plan_id,
                action: bodyReq.action,
            }
        }

        if (is_create) inputData.did_remove.created_by = req.user.id
        return inputData;

    } catch (error) {

        throw error;

    }

}


module.exports = {
    validateRemoveDidHostoryRequest,
    modifyRemoveDidHostoryCreateBodyRequest,
}