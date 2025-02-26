const { StatusCodes } = require('http-status-codes');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const { Logger } = require('../config');
const AppError = require('../utils/errors/app-error');
const { CountryCodeRepository,UserJourneyRepository } = require('../repositories');
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const countryCodeRepository = new CountryCodeRepository();
const userJourneyRepo = new UserJourneyRepository();

async function create(req, res) {

    const bodyReq = req.body;
    const data = {
        name: bodyReq.name.trim(),
        code: bodyReq.code.trim(),
        calling_code: bodyReq.calling_code.trim()
    }

    try {

        const response = await countryCodeRepository.create(data);

        const userJourneyfields = {
            module_name: MODULE_LABEL.COUNTRY_CODE,
            action: ACTION_LABEL.ADD,
            createdBy: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);
        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Successfully created Country Code.';

        Logger.info(`Country Code -> created successfully: ${JSON.stringify(data)}`);

        return res.status(StatusCodes.CREATED).json(SuccessRespnose);

    } catch (error) {

        Logger.error(`Country Code -> unable to create: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`);

        let statusCode = error.statusCode;
        let errorMsg = error.message;
        if (error.name == 'MongoServerError' || error.code == 11000) {
            statusCode = StatusCodes.BAD_REQUEST;
            if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }

        ErrorResponse.message = errorMsg;
        ErrorResponse.error = error;

        return res.status(statusCode).json(ErrorResponse);

    }

}

async function getAll(req, res) {

    try {

        const data = await countryCodeRepository.getAll();
        SuccessRespnose.data = data;
        SuccessRespnose.message = 'Success';

        Logger.info(`Country Code -> recieved all successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Country code -> unable to get country code list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);

    }

}


async function get(req, res) {

    const countryCodeId = req.params.id;

    try {

        const data = await countryCodeRepository.get(countryCodeId);
        SuccessRespnose.data = data;
        if (data.is_deleted) {
            let statusCode = StatusCodes.NOT_FOUND;
            let errorMsg = `Country code -> this country code ${countryCodeId} deleted`;
            ErrorResponse.message = errorMsg;
            ErrorResponse.data = data;
            return res.status(statusCode).json(ErrorResponse);
        }

        Logger.info(`Country Code -> recieved ${countryCodeId} successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Country code not found';
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Country code -> unable to get ${countryCodeId}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}

async function updateCountryCode(req, res) {

    const countryCodeId = req.params.id;
    const bodyReq = req.body;
    const data = {
        name: bodyReq.name.trim(),
        code: bodyReq.code.trim(),
        calling_code: bodyReq.calling_code.trim()
    }

    try {

        const response = await countryCodeRepository.update(countryCodeId, data);

        const userJourneyfields = {
            module_name: MODULE_LABEL.COUNTRY_CODE,
            action: ACTION_LABEL.EDIT,
            createdBy: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Updated successfully';

        Logger.info(`Country Code -> ${countryCodeId} updated successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Country code not found';
        }
        else if (error.name == 'MongoServerError') {
            statusCode = StatusCodes.BAD_REQUEST;
            if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Country code -> unable to update country code: ${countryCodeId}, data: ${data}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}

async function deleteCountryCode(req, res) {
    const id = req.body.countryCodeIds;
    try {
        const response = await countryCodeRepository.deleteMany(id);
        const userJourneyfields = {
            module_name: MODULE_LABEL.COUNTRY_CODE,
            action: ACTION_LABEL.DELETE,
            createdBy: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.message = 'Deleted successfully!';
        SuccessRespnose.data = response;

        Logger.info(`Country Code -> ${id} deleted successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Country code not found';
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Country Code -> unable to delete country code: ${uid}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}


module.exports = {
    create,
    getAll,
    get,
    updateCountryCode,
    deleteCountryCode
}