const {StatusCodes} = require('http-status-codes');
const { ErrorResponse} = require('../../shared/utils/common');
const AppError = require('../../shared/utils/errors/app-error');

function validateRemarkStatusRequest(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Remark Status';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.remark == undefined || !bodyReq.remark.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Remark Status';
        ErrorResponse.error = new AppError(['remark not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    } else if (bodyReq.status == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Remark Status';
        ErrorResponse.error = new AppError(['Status not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }


    next();
}

function modifyRemarkStatusCreateBodyRequest (req, res, next) {
    try {

        const inputData = modifyRemarkStatusRequest(req);
        req.body = inputData;
        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating Remark Statuss';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

function modifyRemarkStatusRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            remark_status: {
                remark : bodyReq.remark,
                status: Number(bodyReq.status)
            }
        }

        if (is_create) inputData.remark_status.created_by = req.user.id

        return inputData;

    } catch (error) {
        console.log(error);

        throw error;

    }

}

function modifyRemarkStatusUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyRemarkStatusRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Remark Statuss.';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Remark Statuss';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.remarkStatusIds == undefined || typeof bodyReq.remarkStatusIds !== 'object' || !bodyReq.remarkStatusIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Remark Statuss';
        ErrorResponse.error = new AppError(['remarkStatusIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateRemarkStatusRequest,
    modifyRemarkStatusCreateBodyRequest,
    modifyRemarkStatusRequest,
    modifyRemarkStatusUpdateBodyRequest,
    validateDeleteRequest
}