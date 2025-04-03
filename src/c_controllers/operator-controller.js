
const { StatusCodes } = require("http-status-codes");
const { OperatorRepository } = require("../c_repositories");

const { SuccessRespnose, ErrorResponse, Authentication } = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");


const operatorsRepo = new OperatorRepository();

async function getAll(req, res) {
  
    try {
        const data = await operatorsRepo.getAll();
        SuccessRespnose.data = data;
        SuccessRespnose.message = "Success";

        Logger.info(
            `Operator -> recieved all successfully`
        );

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


module.exports = {getAll};// Path: cloudtelephony_backend/src/c_controllers/operator-controller.js