const {StatusCodes} = require('http-status-codes');
const { ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateAclSettingsRequest(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Acl setting';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.acl_name == undefined || !bodyReq.acl_name.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Acl setting';
        ErrorResponse.error = new AppError(['acl_name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    if (bodyReq.module_operations) {
        let result = false;
        const moduleOperations = bodyReq.module_operations;
        if (typeof moduleOperations !== 'object' || moduleOperations === null) {
            result = true;
        }

        for (const key in moduleOperations) {
            const value = moduleOperations[key];
            if (typeof value !== 'object' || value === null ||
                !('read' in value) || typeof value.read !== 'boolean' ||
                !('add' in value) || typeof value.add !== 'boolean' ||
                !('edit' in value) || typeof value.edit !== 'boolean' ||
                !('delete' in value) || typeof value.delete !== 'boolean') {
                    result = true
            }
          }

        if (result) {
            ErrorResponse.message = 'Something went wrong creating Acl setting';
            ErrorResponse.error = new AppError(['module operations not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json(ErrorResponse);
        }
    } else {
        ErrorResponse.message = 'Something went wrong creating Acl setting';
        ErrorResponse.error = new AppError(['module operations not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    next();
}

function modifyAclSettingsCreateBodyRequest (req, res, next) {
    try {

        const inputData = modifyAclSettingsRequest(req);

        req.body = inputData;
        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating Acl Settings';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

function modifyAclSettingsRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            acl_settings: {
                acl_name : bodyReq.acl_name,
                module_operations: JSON.stringify(bodyReq.module_operations)
            }
        }

        if (is_create) inputData.acl_settings.createdBy = req.user.id

        return inputData;

    } catch (error) {
        console.log(error);

        throw error;

    }

}

function modifyAclSettingsUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyAclSettingsRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating acl settings.';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Acl Settings';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.aclIds == undefined || typeof bodyReq.aclIds !== 'object' || !bodyReq.aclIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Acl Settings';
        ErrorResponse.error = new AppError(['aclIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateAclSettingsRequest,
    modifyAclSettingsCreateBodyRequest,
    modifyAclSettingsRequest,
    modifyAclSettingsUpdateBodyRequest,
    validateDeleteRequest
}