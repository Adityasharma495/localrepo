const { StatusCodes } = require('http-status-codes');

const { ErrorResponse, constants, Helpers, Authentication } = require('../utils/common');
const AppError = require('../utils/errors/app-error');
const AUTH_TYPES = constants.AUTH_TYPES;
const AUTH_TYPE_NUM_TO_STRING = constants.AUTH_TYPE_NUM_TO_STRING;

function validateTrunksCreate(req, res, next) {

    const bodyReq = req.body;


    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while trunk crate';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.name == undefined || !bodyReq.name.trim()) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.auth_type == undefined || !bodyReq.auth_type) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Auth Type not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.domain == undefined || !bodyReq.domain.trim()) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Domain not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.port == undefined) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Port not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.port < 1024 || bodyReq.port > 65535) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Port is incorrect in incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.pilot_number == undefined || !bodyReq.pilot_number.trim()) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Pilot Number not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.operator == undefined) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['operator not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.channels == undefined) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Channels not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.channels < 0) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Channels is less than 0 in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.cps == undefined) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['cps not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.cps < 0) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['cps is less than 0 in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.codec == undefined) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['codec not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.status == undefined || isNaN(bodyReq.status)) {
        ErrorResponse.message = 'Something went wrong while trunk create';
        ErrorResponse.error = new AppError(['Status not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.auth_type == AUTH_TYPES.IP) {
        if (bodyReq.auth_type_identify_by == undefined || !bodyReq.auth_type_identify_by.trim()) {
            ErrorResponse.message = 'Something went wrong while trunk create';
            ErrorResponse.error = new AppError(['auth_type_identify_by not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }
    else if (bodyReq.auth_type == AUTH_TYPES.REGISTRATION) {
        if (bodyReq.auth_type_registration == undefined) {
            ErrorResponse.message = 'Something went wrong while trunk create';
            ErrorResponse.error = new AppError(['auth_type_registration not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        else if (bodyReq.auth_type_registration.username == undefined || !bodyReq.auth_type_registration.username.trim()) {
            ErrorResponse.message = 'Something went wrong while trunk create';
            ErrorResponse.error = new AppError(['auth_type_identify_by username not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        else if (bodyReq.auth_type_registration.password == undefined || !bodyReq.auth_type_registration.password.trim()) {
            ErrorResponse.message = 'Something went wrong while trunk create';
            ErrorResponse.error = new AppError(['auth_type_identify_by password not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        else if (bodyReq.auth_type_registration.server_url == undefined || !bodyReq.auth_type_registration.server_url.trim()) {
            ErrorResponse.message = 'Something went wrong while trunk create';
            ErrorResponse.error = new AppError(['auth_type_identify_by server_url not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        else if (bodyReq.auth_type_registration.client_url == undefined || !bodyReq.auth_type_registration.client_url.trim()) {
            ErrorResponse.message = 'Something went wrong while trunk create';
            ErrorResponse.error = new AppError(['auth_type_identify_by client_url not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }
    else if (bodyReq.server == undefined || !bodyReq.server.trim()) {
        if (bodyReq.auth_type_identify_by == undefined || !bodyReq.auth_type_identify_by.trim()) {
            ErrorResponse.message = 'Something went wrong while trunk create';
            ErrorResponse.error = new AppError(['server not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }
    next();
}


function modifyTrunkBodyRequest(req, is_create = true) {


    try {

        const bodyReq = req.body;

        const resolvedAuthType = AUTH_TYPE_NUM_TO_STRING[bodyReq.auth_type];

        let inputData = {
            trunk: {
                name: bodyReq.name.trim(),
                auth_type: resolvedAuthType,
                domain: bodyReq.domain.trim(),
                port: Number(bodyReq.port),
                pilot_number: bodyReq.pilot_number.trim(),
                operator_id: bodyReq.operator.trim(),
                channels: Number(bodyReq.channels),
                cps: Number(bodyReq.cps),
                codec_id: bodyReq.codec,
                status: Number(bodyReq.status),
                server_id: bodyReq.server
            }
        }

        if (is_create) inputData.trunk.created_by = req.user.id

        if (resolvedAuthType === 'IP') {
            inputData.trunk.auth_type_identify_by = bodyReq.auth_type_identify_by;
        } else if (resolvedAuthType === 'REGISTRATION') {
            inputData.trunk.auth_type_registration = bodyReq.auth_type_registration;
        }

        return inputData;

    } catch (error) {

        throw error;

    }

}


function modifyTrunkCreateBodyRequest(req, res, next) {

    
    try {

        const inputData = modifyTrunkBodyRequest(req);

        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while creating trunk';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}


function modifyTrunkUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyTrunkBodyRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating trunk';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Trunks';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.trunkIds == undefined || typeof bodyReq.trunkIds !== 'object' || !bodyReq.trunkIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting User';
        ErrorResponse.error = new AppError(['trunkIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}


module.exports = {
    validateTrunksCreate,
    modifyTrunkCreateBodyRequest,
    modifyTrunkUpdateBodyRequest,
    validateDeleteRequest
}