const { StatusCodes } = require('http-status-codes');
const { ErrorResponse, constants } = require('../utils/common');
const AppError = require('../utils/errors/app-error');
const DATA_CENTER_TYPE = constants.DATA_CENTER_TYPE;

function validateDataCenterRequest(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating data center';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.name == undefined || !bodyReq.name.trim()) {
        ErrorResponse.message = 'Something went wrong while creating data center';
        ErrorResponse.error = new AppError(['name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.type == undefined || typeof bodyReq.type !== 'number') {
        ErrorResponse.message = 'Something went wrong while creating data center';
        ErrorResponse.error = new AppError(['type not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.contact_person == undefined || !bodyReq.contact_person.trim()) {
        ErrorResponse.message = 'Something went wrong while creating data center';
        ErrorResponse.error = new AppError(['contact_person not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.contact_email == undefined || !bodyReq.contact_email.trim()) {
        ErrorResponse.message = 'Something went wrong while creating data center';
        ErrorResponse.error = new AppError(['contact_email not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.contact_number == undefined || typeof bodyReq.type !== 'number') {
        ErrorResponse.message = 'Something went wrong while creating data center';
        ErrorResponse.error = new AppError(['contact_number not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.data_centre_company == undefined || !bodyReq.data_centre_company.trim()) {
        ErrorResponse.message = 'Something went wrong while creating data center';
        ErrorResponse.error = new AppError(['data_centre_company not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.data_centre_address == undefined || !bodyReq.data_centre_address.trim()) {
        ErrorResponse.message = 'Something went wrong while creating data center';
        ErrorResponse.error = new AppError(['data_centre_address not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.type == DATA_CENTER_TYPE.DOMESTIC) {
        if (bodyReq.domestic_details == undefined) {
            ErrorResponse.message = 'Something went wrong while creating data center';
            ErrorResponse.error = new AppError(['domestic_details not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        else if (bodyReq.domestic_details.state == undefined || typeof bodyReq.domestic_details.state !== 'object') {
            ErrorResponse.message = 'Something went wrong while creating data center';
            ErrorResponse.error = new AppError(['domestic_details state not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        else if (bodyReq.domestic_details.city == undefined || !bodyReq.domestic_details.city.trim()) {
            ErrorResponse.message = 'Something went wrong while creating data center';
            ErrorResponse.error = new AppError(['domestic_details city not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }
    else if (bodyReq.type == DATA_CENTER_TYPE.INTERNATIONAL) {
        if (bodyReq.overseas_details == undefined) {
            ErrorResponse.message = 'Something went wrong while creating data center';
            ErrorResponse.error = new AppError(['overseas_details not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        else if (bodyReq.overseas_details.country == undefined || typeof bodyReq.overseas_details.country !== 'object') {
            ErrorResponse.message = 'Something went wrong while creating data center';
            ErrorResponse.error = new AppError(['overseas_details country not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        else if (bodyReq.overseas_details.state == undefined || typeof bodyReq.overseas_details.state !== 'object') {
            ErrorResponse.message = 'Something went wrong while creating data center';
            ErrorResponse.error = new AppError(['overseas_details state not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        else if (bodyReq.overseas_details.city == undefined || !bodyReq.overseas_details.city.trim()) {
            ErrorResponse.message = 'Something went wrong while creating data center';
            ErrorResponse.error = new AppError(['overseas_details city not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }
    next();

}

function modifyDataCenterCreateBodyRequest (req, res, next) {
    try {

        const inputData = modifyDataCenterRequest(req);

        req.body = inputData;
        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating data center';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

function modifyDataCenterRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            data_center: {
                name: bodyReq.name.trim(),
                type: Number(bodyReq.type),
                contact_person: bodyReq.contact_person.trim(),
                contact_email: bodyReq.contact_email.trim(),
                contact_number: Number(bodyReq.contact_number),
                data_centre_company: bodyReq.data_centre_company.trim(),
                data_centre_address: bodyReq.data_centre_address.trim(),
            }
        }

        if (is_create) inputData.data_center.created_by = req.user.id

        if (bodyReq.type == DATA_CENTER_TYPE.DOMESTIC) {
            inputData.data_center.domestic_details = bodyReq.domestic_details;
            inputData.data_center.overseas_details = null;

        }
        else if (bodyReq.type == DATA_CENTER_TYPE.INTERNATIONAL) {
            inputData.data_center.overseas_details = bodyReq.overseas_details;
            inputData.data_center.domestic_details = null;

        }
        return inputData;

    } catch (error) {

        throw error;

    }

}

function modifyDataCenterUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyDataCenterRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Data Center.';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting data center';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.dataCenterIds == undefined || typeof bodyReq.dataCenterIds !== 'object' || !bodyReq.dataCenterIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting data center';
        ErrorResponse.error = new AppError(['dataCenterIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateDataCenterRequest,
    modifyDataCenterCreateBodyRequest,
    modifyDataCenterUpdateBodyRequest,
    validateDeleteRequest
}