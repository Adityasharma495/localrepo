const { StatusCodes } = require('http-status-codes');
const {OPEN_WRAPUP, DEFAULT_WRAPUP_TAG} = require('../utils/common/constants')
const { ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateQueueCreate(req, res, next) {

    const bodyReq = req.body;
    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Queue Create';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.name  === undefined || !bodyReq.name.trim()) {
        ErrorResponse.message = 'Something went wrong while Queue Create';
        ErrorResponse.error = new AppError(['name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.extention  === undefined || bodyReq.extention === null) {
        ErrorResponse.message = 'Something went wrong while Queue Create';
        ErrorResponse.error = new AppError(['extention not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.max_wait_time  === undefined || bodyReq.max_wait_time === null) {
        ErrorResponse.message = 'Something went wrong while Queue Create';
        ErrorResponse.error = new AppError(['max_wait_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    const maxWaitTime = parseInt(bodyReq.max_wait_time, 10);
    if (isNaN(maxWaitTime) || maxWaitTime < 0) {
        ErrorResponse.message = 'Something went wrong while Queue Create';
        ErrorResponse.error = new AppError(["Invalid max wait time value"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    else if (bodyReq.open_wrapup  === undefined || bodyReq.open_wrapup === null) {
        ErrorResponse.message = 'Something went wrong while Queue Create';
        ErrorResponse.error = new AppError(['open_wrapup not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    const openWrapup = parseInt(bodyReq.open_wrapup, 10);
    if (!Object.values(OPEN_WRAPUP).includes(openWrapup)) {
        ErrorResponse.message = 'Something went wrong while Queue Update';
        ErrorResponse.error = new AppError(['Invalid open wrap up'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.default_wrapup_tag  === undefined || bodyReq.default_wrapup_tag === null) {
        if (openWrapup !== OPEN_WRAPUP.TURN_OFF) {
            ErrorResponse.message = 'Something went wrong while Queue Create';
            ErrorResponse.error = new AppError(['default_wrapup_tag not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    } else {
        const default_wrapup_tag = parseInt(bodyReq.default_wrapup_tag, 10);
        if (!Object.values(DEFAULT_WRAPUP_TAG).includes(default_wrapup_tag)) {
            ErrorResponse.message =  'Something went wrong while Queue Update';
            ErrorResponse.error = new AppError(["Invalid default wrap up tag"], StatusCodes.BAD_REQUEST);
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
    }

    next();
}

function modifyQueueBodyRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            queue: {
                name: bodyReq.name.trim(),
                extention: bodyReq.extention.trim(),
                max_wait_time: Number(bodyReq.max_wait_time),
                open_wrapup: Number(bodyReq.open_wrapup),
                default_wrapup_tag: Number(bodyReq.default_wrapup_tag) ?? null,
                wrapper_session_timeout: Number(bodyReq.wrapper_session_timeout),
            }
        }

        if (is_create) inputData.queue.createdBy = req.user.id
        return inputData;

    } catch (error) {
        throw error;

    }

}


function modifyQueueCreateBodyRequest(req, res, next) {

    try {

        const inputData = modifyQueueBodyRequest(req);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while creating Queue';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}


function modifyQueueUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyQueueBodyRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Queue';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Queue';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.queueIds == undefined || typeof bodyReq.queueIds !== 'object' || !bodyReq.queueIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Queue';
        ErrorResponse.error = new AppError(['queueIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateQueueCreate,
    modifyQueueCreateBodyRequest,
    modifyQueueUpdateBodyRequest,
    validateDeleteRequest
}