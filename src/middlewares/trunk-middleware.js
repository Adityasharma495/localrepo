const { StatusCodes } = require('http-status-codes');

const { ErrorResponse, constants, Helpers, Authentication } = require('../../shared/utils/common');
const AppError = require('../../shared/utils/errors/app-error');
const AUTH_TYPES = constants.AUTH_TYPES;
const AUTH_TYPE_NUM_TO_STRING = constants.AUTH_TYPE_NUM_TO_STRING;

function validateTrunksCreate(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Invalid content type';
        ErrorResponse.error = new AppError(['Request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.name == undefined || !bodyReq.name.trim()) {
        ErrorResponse.message = 'Missing or invalid trunk name';
        ErrorResponse.error = new AppError(['"name" is required and must be a non-empty string'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.auth_type == undefined || !bodyReq.auth_type) {
        ErrorResponse.message = 'Missing auth type';
        ErrorResponse.error = new AppError(['"auth_type" is required'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.domain == undefined || !bodyReq.domain.trim()) {
        ErrorResponse.message = 'Missing or invalid domain';
        ErrorResponse.error = new AppError(['"domain" is required and must be a non-empty string'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.port == undefined) {
        ErrorResponse.message = 'Missing port';
        ErrorResponse.error = new AppError(['"port" is required'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.port < 1024 || bodyReq.port > 65535) {
        ErrorResponse.message = 'Invalid port range';
        ErrorResponse.error = new AppError(['"port" must be between 1024 and 65535'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.pilot_number == undefined || !bodyReq.pilot_number.trim()) {
        ErrorResponse.message = 'Missing or invalid pilot number';
        ErrorResponse.error = new AppError(['"pilot_number" is required and must be a non-empty string'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.operator == undefined) {
        ErrorResponse.message = 'Missing operator';
        ErrorResponse.error = new AppError(['"operator" is required'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.channels == undefined) {
        ErrorResponse.message = 'Missing channels';
        ErrorResponse.error = new AppError(['"channels" is required'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.channels < 0) {
        ErrorResponse.message = 'Invalid channels value';
        ErrorResponse.error = new AppError(['"channels" cannot be less than 0'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.cps == undefined) {
        ErrorResponse.message = 'Missing cps';
        ErrorResponse.error = new AppError(['"cps" is required'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.cps < 0) {
        ErrorResponse.message = 'Invalid cps value';
        ErrorResponse.error = new AppError(['"cps" cannot be less than 0'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.codec == undefined) {
        ErrorResponse.message = 'Missing codec';
        ErrorResponse.error = new AppError(['"codec" is required'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.status == undefined || isNaN(bodyReq.status)) {
        ErrorResponse.message = 'Missing or invalid status';
        ErrorResponse.error = new AppError(['"status" is required and must be a number'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.auth_type == AUTH_TYPES.IP) {
        if (bodyReq.auth_type_identify_by == undefined || !bodyReq.auth_type_identify_by.trim()) {
            ErrorResponse.message = 'Missing IP-based identification';
            ErrorResponse.error = new AppError(['"auth_type_identify_by" is required for IP authentication'], StatusCodes.BAD_REQUEST);
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
    }

    if (bodyReq.auth_type == AUTH_TYPES.REGISTRATION) {
        if (bodyReq.auth_type_registration == undefined) {
            ErrorResponse.message = 'Missing registration auth object';
            ErrorResponse.error = new AppError(['"auth_type_registration" object is required for REGISTRATION auth_type'], StatusCodes.BAD_REQUEST);
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        const { username, password, server_url, client_url } = bodyReq.auth_type_registration;

        if (username == undefined || !username.trim()) {
            ErrorResponse.message = 'Missing registration username';
            ErrorResponse.error = new AppError(['"username" is required in auth_type_registration'], StatusCodes.BAD_REQUEST);
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        if (password == undefined || !password.trim()) {
            ErrorResponse.message = 'Missing registration password';
            ErrorResponse.error = new AppError(['"password" is required in auth_type_registration'], StatusCodes.BAD_REQUEST);
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        if (server_url == undefined || !server_url.trim()) {
            ErrorResponse.message = 'Missing server URL';
            ErrorResponse.error = new AppError(['"server_url" is required in auth_type_registration'], StatusCodes.BAD_REQUEST);
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        if (client_url == undefined || !client_url.trim()) {
            ErrorResponse.message = 'Missing client URL';
            ErrorResponse.error = new AppError(['"client_url" is required in auth_type_registration'], StatusCodes.BAD_REQUEST);
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
    }

    if (bodyReq.server == undefined || !bodyReq.server.toString().trim()) {
        ErrorResponse.message = 'Missing server';
        ErrorResponse.error = new AppError(['"server" is required'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
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