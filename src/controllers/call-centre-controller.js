const { StatusCodes } = require('http-status-codes');
const { CallCentreRepository, UserRepository, CompanyRepository, UserJourneyRepository } = require('../repositories');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const { Logger } = require('../config');
const AppError = require('../utils/errors/app-error');
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const callCentreRepository = new CallCentreRepository();
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const userJourneyRepo = new UserJourneyRepository();

async function create(req, res) {

    const bodyReq = req.body;
    const userId = req.user.id;
    let data = null;

    try {

        data = {
            name: bodyReq.name.trim(),
            domain: bodyReq.domain.trim(),
            description: bodyReq.description.trim(),
            createdBy: req.user.id,
            company: req.user.companies.id,
            country_code: bodyReq.countryCode.trim(),
            timezone: bodyReq.timezone.trim()
        }

        const response = await callCentreRepository.create(data);
        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Successfully created call centre';

        const userJourneyfields = {
            module_name: MODULE_LABEL.CALL_CENTER,
            action: ACTION_LABEL.ADD,
            createdBy: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);

        Logger.info(`Call Centre -> created successfully: ${JSON.stringify(data)}`);

        return res.status(StatusCodes.CREATED).json(SuccessRespnose);

    } catch (error) {

        Logger.error(`Call Centre -> unable to create: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`);

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

        const data = await callCentreRepository.getAll(req.user.id);
        SuccessRespnose.data = data;
        SuccessRespnose.message = 'Success';

        Logger.info(`Call Centre -> recieved all successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Call Centre -> unable to get call centres list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);

    }

}


async function get(req, res) {

    const callCentreId = req.params.id;

    try {

        const data = await callCentreRepository.get(callCentreId);
        SuccessRespnose.data = data;

        Logger.info(`Call Centre -> recieved ${callCentreId} successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Call Centre not found';
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Call Centre -> unable to get ${callCentreId}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}


async function updateCallCentre(req, res) {

    const callCentreId = req.params.id;
    const bodyReq = req.body;
    const data = {
        name: bodyReq.name.trim(),
        domain: bodyReq.domain.trim(),
        description: bodyReq.description.trim(),
        country_code: bodyReq.countryCode.trim(),
        timezone: bodyReq.timezone.trim()
    }

    try {

        const response = await callCentreRepository.update(callCentreId, data);

        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Updated successfully';

        const userJourneyfields = {
            module_name: MODULE_LABEL.CALL_CENTER,
            action: ACTION_LABEL.EDIT,
            createdBy: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);


        Logger.info(`Call Centre -> ${callCentreId} updated successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Call Centre not found';
        }
        else if (error.name == 'MongoServerError') {
            statusCode = StatusCodes.BAD_REQUEST;
            if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Call Centre -> unable to update user: ${callCentreId}, data: ${data}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}


async function getUsers(req, res) {

    const callCentreId = req.params.id;

    try {

        const data = await userRepository.getCallCentreUsers(callCentreId);
        SuccessRespnose.data = data;

        Logger.info(`Call Centre -> recieved users based on ${callCentreId} successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == 'CastError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = 'Call Centre not found';
        }
        ErrorResponse.message = errorMsg;

        Logger.error(`Call Centre -> unable to get users: ${callCentreId}, error: ${JSON.stringify(error)}`);

        return res.status(statusCode).json(ErrorResponse);

    }

}

module.exports = {
    create,
    getAll,
    get,
    updateCallCentre,
    getUsers
}
