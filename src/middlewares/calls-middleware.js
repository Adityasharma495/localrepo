const { StatusCodes } = require('http-status-codes');

const { ErrorResponse, constants, Helpers, Authentication } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateCallsCreate(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while trunk crate';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.caller_number == undefined || !bodyReq.caller_number) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Caller Number not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}


function modifyCallsBodyRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;

        let inputData = {
            calls: {
                caller_number: Number(bodyReq.caller_number)
            }
        }

        if (is_create) inputData.calls.createdBy = req.user.id

        if (bodyReq.did) {
            inputData.calls.did = bodyReq.did.trim()
        }

        if (bodyReq.answer_status) {
            inputData.calls.answer_status = bodyReq.answer_status.trim()
        }

        if (bodyReq.end_time) {
            inputData.calls.end_time = bodyReq.end_time.trim()
        }

        if (bodyReq.patch_duration) {
            inputData.calls.patch_duration = Number(bodyReq.patch_duration)
        }

        if (bodyReq.billing_duration) {
            inputData.calls.billing_duration = Number(bodyReq.billing_duration)
        }

        if (bodyReq.dtmf) {
            inputData.calls.dtmf = bodyReq.dtmf.trim()
        }

        if (bodyReq.end_time) {
            inputData.calls.end_time = bodyReq.end_time.trim()
        }

        if (bodyReq.dnd) {
            inputData.calls.dnd = Boolean(bodyReq.dnd)
        }

        if (bodyReq.call_sid) {
            inputData.calls.call_sid = bodyReq.call_sid.trim()
        }

        if (bodyReq.start_time) {
            inputData.calls.start_time = bodyReq.start_time.trim()
        }

        if (bodyReq.pulses) {
            inputData.calls.pulses = Number(bodyReq.pulses)
        }

        if (bodyReq.hangup_cause) {
            inputData.calls.hangup_cause = bodyReq.hangup_cause.trim()
        }

        if (bodyReq.trunk) {
            inputData.calls.trunk = bodyReq.trunk.trim()
        }

        if (bodyReq.callee_number) {
            inputData.calls.callee_number = bodyReq.callee_number.trim()
        }

        if (bodyReq.bridge_time) {
            inputData.calls.bridge_time = bodyReq.bridge_time.trim()
        }

        if (bodyReq.bridge_ring_duration) {
            inputData.calls.bridge_ring_duration = Number(bodyReq.bridge_ring_duration)
        }

        if (bodyReq.recording_file) {
            inputData.calls.recording_file = bodyReq.recording_file.trim()
        }

        if (bodyReq.recording_uploaded) {
            inputData.calls.recording_uploaded = Boolean(bodyReq.recording_uploaded)
        }

        if (bodyReq.caller_profile) {
            inputData.calls.caller_profile = bodyReq.caller_profile.trim()
        }

        if (bodyReq.category) {
            inputData.calls.category = bodyReq.category.trim()
        }

        return inputData;

    } catch (error) {

        throw error;

    }

}


function modifyCallsCreateBodyRequest(req, res, next) {

    try {

        const inputData = modifyCallsBodyRequest(req);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while creating calls';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}


function modifyCallsUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyCallsBodyRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating calls';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

module.exports = {
    validateCallsCreate,
    modifyCallsCreateBodyRequest,
    modifyCallsUpdateBodyRequest
}