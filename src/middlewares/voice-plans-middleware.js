const {StatusCodes} = require('http-status-codes');
const { ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateVoicePlanRequest(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Voice Plan';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.plan_name == undefined || !bodyReq.plan_name.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Voice Plan';
        ErrorResponse.error = new AppError(['plan_name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    } 
    else if (bodyReq.plans.length < 0) {
        ErrorResponse.message = 'Something went wrong while creating Voice Plan';
        ErrorResponse.error = new AppError(['Plans Data not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    
    next();
}

function validateVoicePlanUpdateRequest(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Updating Voice Plan';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.DID == undefined) {
        ErrorResponse.message = 'Something went wrong while Updating Voice Plan';
        ErrorResponse.error = new AppError(['DID not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    } 
    else if (bodyReq.voice_plan_id == undefined) {
        ErrorResponse.message = 'Something went wrong while Updating Voice Plan';
        ErrorResponse.error = new AppError(['Voice Plan Id not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    
    next();
}

function modifyVoicePlansCreateBodyRequest (req, res, next) {
    try {

        const inputData = modifyVoicePlansRequest(req);

        req.body = inputData;
        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating Voice Plan';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

function modifyVoicePlansRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            voice_plan: {
                plan_name : bodyReq.plan_name,
                plans: bodyReq.plans,
            }
        }

        if (is_create) inputData.voice_plan.user_id = req.user.id
        return inputData;

    } catch (error) {
        console.log(error);

        throw error;

    }

}


module.exports = {
    validateVoicePlanRequest,
    modifyVoicePlansCreateBodyRequest,
    modifyVoicePlansRequest,
    validateVoicePlanUpdateRequest
}