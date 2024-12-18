const { StatusCodes } = require("http-status-codes");
const { OperatorsRepository, UserJourneyRepository } = require("../repositories");
const { SuccessRespnose, ErrorResponse, Authentication } = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");

const operatorsRepo = new OperatorsRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createOperator(req, res) {
    const bodyReq = req.body;

    try {
        const responseData = {};
        const operator = await operatorsRepo.create(bodyReq.operator);
        responseData.operator = operator;

        const userJourneyfields = {
            module_name: MODULE_LABEL.OPERATOR,
            action: ACTION_LABEL.ADD,
            createdBy: req?.user?.id
        }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.data = responseData;
        SuccessRespnose.message = "Successfully created a new Operator";

        Logger.info(
            `Operator -> created successfully: ${JSON.stringify(responseData)}`
        );

        return res.status(StatusCodes.CREATED).json(SuccessRespnose);
    } catch (error) {
        Logger.error(
            `Operator -> unable to create operator: ${JSON.stringify(
                bodyReq
            )} error: ${JSON.stringify(error)}`
        );

        let statusCode = error.statusCode;
        let errorMsg = error.message;
        if (error.name == "MongoServerError" || error.code == 11000) {
            statusCode = StatusCodes.BAD_REQUEST;
            if (error.codeName == "DuplicateKey")
                errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }

        ErrorResponse.message = errorMsg;
        ErrorResponse.error = error;

        return res.status(statusCode).json(ErrorResponse);
    }
}




async function getAll(req, res) {
  
    try {
        const data = await operatorsRepo.getAll();
        SuccessRespnose.data = data;
        SuccessRespnose.message = "Success";

        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(
            `trunk -> unable to get trunk list, error: ${JSON.stringify(error)}`
        );

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}


async function get(req, res) {
    const id = req.params.id;

    try {
        const operatorData = await operatorsRepo.get(id);
        if (operatorData.length == 0) {
            const error = new Error();
            error.name = 'CastError';
            throw error;
        }
        SuccessRespnose.message = "Success";
        SuccessRespnose.data = operatorData;

        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == "CastError") {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = "Trunk not found";
        }
        ErrorResponse.message = errorMsg;

        Logger.error(
            `User -> unable to get ${id}, error: ${JSON.stringify(error)}`
        );

        return res.status(statusCode).json(ErrorResponse);
    }
}

async function deleteOperator(req, res) {
    const id = req.body.operatorIds;

    try {
        const response = await operatorsRepo.deleteMany(id);

        const userJourneyfields = {
            module_name: MODULE_LABEL.OPERATOR,
            action: ACTION_LABEL.DELETE,
            createdBy: req?.user?.id
        }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.message = "Deleted successfully!";
        SuccessRespnose.data = response;

        Logger.info(`Operator -> ${id} deleted successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == "CastError") {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = "Operator not found";
        }
        ErrorResponse.message = errorMsg;

        Logger.error(
            `Operator -> unable to delete operator: ${id}, error: ${JSON.stringify(error)}`
        );

        return res.status(statusCode).json(ErrorResponse);
    }
}


async function updateOperator(req, res) {
    const uid = req.params.id;
    const bodyReq = req.body;
    try {

        const responseData = {};
        const operator = await operatorsRepo.update(uid, bodyReq.operator);
        if (!operator) {
            const error = new Error();
            error.name = 'CastError';
            throw error;
        }
        responseData.operator = operator;

        const userJourneyfields = {
            module_name: MODULE_LABEL.OPERATOR,
            action: ACTION_LABEL.EDIT,
            createdBy: req?.user?.id
        }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.message = 'Updated successfully!';
        SuccessRespnose.data = responseData;

        Logger.info(`Operator -> ${uid} updated successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Operator not found';
        }
        else if (error.name == 'MongoServerError') {
            statusCode = StatusCodes.BAD_REQUEST;
            if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Operator-> unable to update Operator: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }
}

module.exports = {
    createOperator,
    getAll,
    get,
    deleteOperator,
    updateOperator
};