const { StatusCodes } = require('http-status-codes');

const { ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateAgentCreate(req, res, next) {

    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Agent Create';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.agent_name == undefined || !bodyReq.agent_name.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['agent_name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.agent_number == undefined || !bodyReq.agent_number.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['agent_number not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.access == undefined || !bodyReq.access.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['access not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    } else if (bodyReq.email_id == undefined || !bodyReq.email_id.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['email_id not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.description == undefined || !bodyReq.description.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['description not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }else if (bodyReq.username == undefined || !bodyReq.username.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['username not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.type == undefined || !bodyReq.type.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['type not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }else if (bodyReq.password == undefined || !bodyReq.password.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['password not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }else if (bodyReq.extention && !Array.isArray(bodyReq.extention)) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['extention not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

function modifyAgentBodyRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;

        let inputData = {
            agent: {
                agent_name: bodyReq.agent_name.trim(),
                agent_number: Number(bodyReq.agent_number),
                extention: bodyReq?.extention || [],
                access:bodyReq.access.trim(),
                type:bodyReq.type.trim(),
                email_id:bodyReq.email_id.trim(),
                description:bodyReq.description.trim(),
                username:bodyReq.username.trim(),
                password:bodyReq.password.trim(),
                // login_status:bodyReq.login_status
            }
        }

        if (is_create) inputData.agent.createdBy = req.user.id
        return inputData;

    } catch (error) {

        throw error;

    }

}


function modifyAgentCreateBodyRequest(req, res, next) {


    try {

        const inputData = modifyAgentBodyRequest(req);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = '';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}


function modifyAgentUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyAgentBodyRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Agent';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Agent';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.agentIds == undefined || typeof bodyReq.agentIds !== 'object' || !bodyReq.agentIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Agent';
        ErrorResponse.error = new AppError(['agentIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateAgentCreate,
    modifyAgentCreateBodyRequest,
    modifyAgentUpdateBodyRequest,
    validateDeleteRequest
}