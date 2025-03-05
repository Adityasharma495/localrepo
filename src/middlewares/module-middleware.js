const { StatusCodes } = require('http-status-codes');

const { ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateModuleCreate(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while module Create';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.module_name == undefined || !bodyReq.module_name.trim()) {
        ErrorResponse.message = 'Something went wrong while module Create';
        ErrorResponse.error = new AppError(['module_name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
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
    next();
}

function modifyModuleBodyRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;

        let inputData = {
            module: {
                module_name: bodyReq.module_name.trim(),
                status: Number(bodyReq.status),
            }
        }

        if (is_create) inputData.module.created_by = req.user.id


        return inputData;

    } catch (error) {

        throw error;

    }

}


function modifyModuleCreateBodyRequest(req, res, next) {

    try {

        const inputData = modifyModuleBodyRequest(req);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while creating module';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}


function modifyModuleUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyModuleBodyRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating module';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Module';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.moduleIds == undefined || typeof bodyReq.moduleIds !== 'object' || !bodyReq.moduleIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Module';
        ErrorResponse.error = new AppError(['moduleIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateModuleCreate,
    modifyModuleCreateBodyRequest,
    modifyModuleUpdateBodyRequest,
    validateDeleteRequest
}