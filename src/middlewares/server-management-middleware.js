const {StatusCodes} = require('http-status-codes');
const { ErrorResponse, constants } = require('../../shared/utils/common');
const AppError = require('../../shared/utils/errors/app-error');

function validateServerManagementRequest(req, res, next) {
    const bodyReq = req.body;
    const digitRegex = /^\d+$/;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.data_center == undefined || !bodyReq.data_center.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = new AppError(['data_center not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.type == undefined || typeof bodyReq.type !== 'number') {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = new AppError(['type not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.server_ip == undefined || !bodyReq.server_ip.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = new AppError(['server_ip not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.server_name == undefined || !bodyReq.server_name.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = new AppError(['server_name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.os == undefined || !bodyReq.os.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = new AppError(['os not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.cpu_cores == undefined || !bodyReq.cpu_cores.trim() || !digitRegex.test(bodyReq.cpu_cores)) {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = new AppError(['cpu_cores not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.ram == undefined || !bodyReq.ram.trim() || !digitRegex.test(bodyReq.ram)) {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = new AppError(['ram not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.hard_disk == undefined || !bodyReq.hard_disk.trim() || !digitRegex.test(bodyReq.hard_disk)) {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = new AppError(['hard_disk not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

function modifyServerManagementCreateBodyRequest (req, res, next) {
    try {

        const inputData = modifyServerManagementRequest(req);

        req.body = inputData;
        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating Server Management';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

function modifyServerManagementRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            server: {
                data_center: bodyReq.data_center,
                type: Number(bodyReq.type),
                server_ip: bodyReq.server_ip.trim(),
                server_name: bodyReq.server_name.trim(),
                os: bodyReq.os,
                cpu_cores: Number(bodyReq.cpu_cores),
                ram: Number(bodyReq.ram),
                hard_disk: Number(bodyReq.hard_disk)
            }
        }

        if (is_create) inputData.server.created_by = req.user.id

        return inputData;

    } catch (error) {
        console.log(error);

        throw error;

    }

}

function modifyServerManagementUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyServerManagementRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Server.';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Server';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.serverIds == undefined || typeof bodyReq.serverIds !== 'object' || !bodyReq.serverIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Server';
        ErrorResponse.error = new AppError(['serverIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

module.exports = {validateServerManagementRequest, modifyServerManagementCreateBodyRequest, modifyServerManagementRequest, modifyServerManagementUpdateBodyRequest, validateDeleteRequest}