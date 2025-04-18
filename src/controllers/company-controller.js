const { StatusCodes } = require('http-status-codes');
const { CompanyRepository, UserJourneyRepository } = require('../repositories');
const { SuccessRespnose, ErrorResponse, ResponseFormatter } = require('../utils/common');
const { Logger } = require('../config');
const AppError = require('../utils/errors/app-error');
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const companyRepository = new CompanyRepository();
const userJourneyRepo = new UserJourneyRepository();

async function create(req, res){

    const bodyReq = req.body;
    try {

        // check for duplicate Company name
        const conditions = {
            created_by: req.user.id, 
            name: bodyReq.company.name 
        }
        const checkDuplicate = await companyRepository.findOne(conditions);
            
        if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
            ErrorResponse.message = `Company Name Already Exists`;
                return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }

        const response = await companyRepository.create(bodyReq.company);

        const userJourneyfields = {
            module_name: MODULE_LABEL.COMPANY,
            action: ACTION_LABEL.ADD,
            created_by: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Successfully created company';

        Logger.info(`Company -> created successfully: ${ JSON.stringify(response) }`);
        
        return res.status(StatusCodes.CREATED).json(SuccessRespnose);
        
    } catch (error) {
        console.log(error)
        Logger.error(`Company -> unable to create error: ${ JSON.stringify(error) }`);

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

        const data = await companyRepository.getAll(req.user.id);
        SuccessRespnose.message = 'Success';

        Logger.info(`Company -> recieved all successfully`);

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

        Logger.info(`Company -> recieved ${companyId} successfully`);
        
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
        const currentData = await companyRepository.get(companyId);

        // Check for duplicate flow Name
        if (currentData.name !== bodyReq.company.name) {
          const nameCondition = {
            created_by: req.user.id,
            name: bodyReq.company.name
          };
        
          const nameDuplicate = await companyRepository.findOne(nameCondition);
          if (nameDuplicate) {
              ErrorResponse.message = 'Company Name already exists';
              return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }
        }
        const response = await companyRepository.update(companyId, bodyReq.company);

        const userJourneyfields = {
            module_name: MODULE_LABEL.COMPANY,
            action: ACTION_LABEL.EDIT,
            created_by: req?.user?.id
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
