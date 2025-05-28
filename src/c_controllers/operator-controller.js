const { StatusCodes } = require("http-status-codes");
const { OperatorsRepository, UserJourneyRepository } = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const { MODULE_LABEL, ACTION_LABEL } = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");
const AppError = require("../../shared/utils/errors/app-error");
const operatorsRepo = new OperatorsRepository();
const userJourneyRepo = new UserJourneyRepository();
const { Op } = require("sequelize");


async function createOperator(req, res) {
    try {
        const existingOperator = await operatorsRepo.findOne({
            created_by: req.user.id,
            name: req.body?.operator?.name
        });
            
        if (existingOperator) {
            ErrorResponse.message = 'Operator With Same Name Already Exists.';
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
        }
        const operator = await operatorsRepo.create(req.body.operator);
        
        await userJourneyRepo.create({
            module_name: MODULE_LABEL.OPERATOR,
            action: ACTION_LABEL.ADD,
            created_by: req?.user?.id
        });

        SuccessRespnose.data = operator;
        SuccessRespnose.message = "Successfully created a new Operator";
        Logger.info(`Operator created successfully: ${JSON.stringify(operator)}`);

        return res.status(StatusCodes.CREATED).json(SuccessRespnose);
    } catch (error) {
        Logger.error(`Unable to create operator: ${JSON.stringify(error)}`);
        ErrorResponse.message = error.message || "An error occurred";
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function getAll(req, res) {
    try {
        const data = await operatorsRepo.getAll();
        SuccessRespnose.data = data;
        SuccessRespnose.message = "Success";
        Logger.info("Retrieved all operators successfully");
        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
        Logger.error(`Unable to get operators: ${JSON.stringify(error)}`);
        ErrorResponse.message = error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function get(req, res) {
    try {
        const operatorData = await operatorsRepo.get(req.params.id);
        if (!operatorData) throw new AppError("Operator not found", StatusCodes.NOT_FOUND);
        
        SuccessRespnose.data = operatorData;
        SuccessRespnose.message = "Success";
        Logger.info(`Retrieved operator ${req.params.id} successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
        Logger.error(`Unable to get operator ${req.params.id}: ${JSON.stringify(error)}`);
        ErrorResponse.message = error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function deleteOperator(req, res) {
    try {
        await operatorsRepo.deleteMany(req.body.operatorIds);
        
        await userJourneyRepo.create({
            module_name: MODULE_LABEL.OPERATOR,
            action: ACTION_LABEL.DELETE,
            created_by: req?.user?.id
        });
        
        SuccessRespnose.message = "Deleted successfully!";
        Logger.info(`Operators ${req.body.operatorIds} deleted successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
        Logger.error(`Unable to delete operators: ${JSON.stringify(error)}`);
        ErrorResponse.message = error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function updateOperator(req, res) {
    try {
        const existingOperator = await operatorsRepo.findOne({
            created_by: req.user.id,
            id: { [Op.ne]: req.params.id },
            name: req.body?.operator?.name
        });
            
        if (existingOperator) {
            ErrorResponse.message = 'Operator With Same Name Already Exists.';
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
        }
        const operator = await operatorsRepo.update(req.params.id, req.body.operator);
        if (!operator) throw new AppError("Operator not found", StatusCodes.NOT_FOUND);
        
        await userJourneyRepo.create({
            module_name: MODULE_LABEL.OPERATOR,
            action: ACTION_LABEL.EDIT,
            created_by: req?.user?.id
        });
        
        SuccessRespnose.message = "Updated successfully!";
        SuccessRespnose.data = operator;
        Logger.info(`Operator ${req.params.id} updated successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
        Logger.error(`Unable to update operator ${req.params.id}: ${JSON.stringify(error)}`);
        ErrorResponse.message = error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

module.exports = {
    createOperator,
    getAll,
    get,
    deleteOperator,
    updateOperator
};
