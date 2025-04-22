const { StatusCodes } = require('http-status-codes');
const { CompanyRepository, UserJourneyRepository } = require('../c_repositories');
const { SuccessRespnose, ErrorResponse, ResponseFormatter } = require('../utils/common');
const { Logger } = require('../config');
const AppError = require('../utils/errors/app-error');
const { MODULE_LABEL, ACTION_LABEL } = require('../utils/common/constants');

const companyRepository = new CompanyRepository();
const userJourneyRepo = new UserJourneyRepository();

const version = process.env.API_V || "1";

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





async function getAll(req, res) {

  const userId = req.user.id
  try {
    const data = await companyRepository.getAll(userId);

    SuccessRespnose.data = ResponseFormatter.formatResponseIds(data,version)
    SuccessRespnose.message = 'Success';

    Logger.info(`Company -> received all successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(`Company -> unable to get companies list, error: ${JSON.stringify(error)}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function get(req, res) {
  const companyId = req.params.id;

  try {
    const data = await companyRepository.get(companyId);
    if (!data) throw new AppError('Company not found', StatusCodes.NOT_FOUND);

    SuccessRespnose.data = data;
    Logger.info(`Company -> received ${companyId} successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    console.log("errorr", error);
    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || 'Something went wrong';

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(`Company -> unable to get ${companyId}, error: ${JSON.stringify(error)}`);
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateCompany(req, res) {
  const companyId = req.params.id;

  try {
    const bodyReq = req.body;
    const data = {
      name: bodyReq?.company?.name?.trim().toLowerCase(),
      phone: bodyReq?.company?.phone?.trim(),
      pincode: bodyReq?.company?.pincode?.trim(),
      address: bodyReq?.company?.address?.trim(),
      category: bodyReq?.company?.category || null,
    };

    const response = await companyRepository.update(companyId, data);
    if (!response) throw new AppError('Company not found', StatusCodes.NOT_FOUND);

    const userJourneyfields = {
      module_name: MODULE_LABEL.COMPANY,
      action: ACTION_LABEL.EDIT,
      created_by: req.user.id
    };

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.data = response;
    SuccessRespnose.message = 'Updated successfully';

    Logger.info(`Company -> ${companyId} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || 'Something went wrong';

    if (error.name === 'SequelizeUniqueConstraintError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = `Duplicate key, record already exists for ${error.errors[0].path}`;
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(`Company -> unable to update ${companyId}, error: ${JSON.stringify(error)}`);
    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  create,
  getAll,
  get,
  updateCompany
};
