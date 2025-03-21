const {StatusCodes} = require('http-status-codes');
const { ErrorResponse, constants } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateIncomingReportRequest(req, res, next) {
    const bodyReq = req.body;
    const digitRegex = /^\d+$/;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.user_id == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['user_id not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.call_sid == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['call_sid not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.caller_number == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['caller_number not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.callee_number == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['callee_number not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.start_time == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['start_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.end_time == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['end_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.bridge_time == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['bridge_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.billing_duration == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['billing_duration not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.patch_duration == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['patch_duration not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.bridge_ring_duration == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['bridge_ring_duration not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.answer_status == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['answer_status not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.dtmf == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['dtmf not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.pulses == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['pulses not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.dnd == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['dnd not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.hangup_cause == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['hangup_cause not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.trunk == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['trunk not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.recording_file == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['recording_file not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.recording_uploaded == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['recording_uploaded not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.caller_profile == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['caller_profile not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.category == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['category not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.status == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['status not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.agent_id == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['agent_id not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.agent_number == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['agent_number not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.agent_name == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['agent_name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.queue_name == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['queue_name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.queue_hold_time == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['queue_hold_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.hold_last_start_time == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['hold_last_start_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.total_hold_duration == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['total_hold_duration not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.report_time == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = new AppError(['report_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

function modifyIncomingReportCreateBodyRequest (req, res, next) {
    try {

        const inputData = modifyIncomingRequest(req);

        req.body = inputData;
        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating Incoming Report';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

function modifyIncomingRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            incomingReport: {
                ... bodyReq
            }
        }

        return inputData;

    } catch (error) {
        console.log(error);

        throw error;

    }

}

function modifyIncomingReportUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyIncomingRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Incoming Report.';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Incoming Report';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.reportIds == undefined || typeof bodyReq.reportIds !== 'object' || !bodyReq.reportIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Incoming Report';
        ErrorResponse.error = new AppError(['reportIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

module.exports = {validateIncomingReportRequest, modifyIncomingReportCreateBodyRequest, modifyIncomingRequest, modifyIncomingReportUpdateBodyRequest, validateDeleteRequest}