const { StatusCodes } = require('http-status-codes');
const { CompanyRepository, UserJourneyRepository } = require('../repositories');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const { Logger } = require('../config');
const AppError = require('../utils/errors/app-error');
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const companyRepository = new CompanyRepository();
const userJourneyRepo = new UserJourneyRepository();

async function create(req, res){

    const bodyReq = req.body;
    const data = { name: bodyReq.name, createdBy: req.user.id }

    try {

        const response = await companyRepository.create(data);

        const userJourneyfields = {
            module_name: MODULE_LABEL.COMPANY,
            action: ACTION_LABEL.ADD,
            createdBy: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Successfully created company';

        Logger.info(`Company -> created successfully: ${ JSON.stringify(response) }`);
        
        return res.status(StatusCodes.CREATED).json(SuccessRespnose);
        
    } catch (error) {
        
        Logger.error(`Company -> unable to create: ${ JSON.stringify(data) } error: ${ JSON.stringify(error) }`);

        let statusCode = error.statusCode;
        let errorMsg = error.message;
        if(error.name == 'MongoServerError' || error.code == 11000){
            statusCode = StatusCodes.BAD_REQUEST;
            if(error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }

        ErrorResponse.message = errorMsg;
        ErrorResponse.error = error;

        return res.status(statusCode).json(ErrorResponse);

    }

}


async function getAll(req, res){

    try {

        const data = await companyRepository.getAll();
        SuccessRespnose.data = data;
        SuccessRespnose.message = 'Success';

        return res.status(StatusCodes.OK).json(SuccessRespnose);
        
    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Company -> unable to get companies list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        
    }

}


async function get(req, res){

    const companyId = req.params.id;

    try {

        const data = await companyRepository.get(companyId);
        SuccessRespnose.data = data;
        
        return res.status(StatusCodes.OK).json(SuccessRespnose);
        
    } catch (error) {
        
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;
        
        ErrorResponse.error = error;
        if(error.name == 'CastError'){
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Company not found';
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Company -> unable to get ${companyId}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}


async function updateCompany(req, res){

    const companyId = req.params.id;

    try {

        const bodyReq = req.body;
        const data = {
            name: bodyReq.name.trim()
        }

        const response = await companyRepository.update(companyId, data);

        const userJourneyfields = {
            module_name: MODULE_LABEL.COMPANY,
            action: ACTION_LABEL.EDIT,
            createdBy: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Updated successfully';


        Logger.info(`Company -> ${companyId} updated successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);
        
    } catch (error) {
        
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if(error.name == 'CastError'){
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Company not found';
        }
        else if(error.name == 'MongoServerError'){
            statusCode = StatusCodes.BAD_REQUEST;
            if(error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Company -> unable to update user: ${companyId}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}

module.exports = {
    create,
    getAll,
    get,
    updateCompany
}
