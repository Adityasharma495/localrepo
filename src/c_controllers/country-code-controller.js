const { StatusCodes } = require('http-status-codes');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const { Logger } = require('../config');
const { CountryCodeRepository, UserJourneyRepository } = require('../c_repositories');
const { MODULE_LABEL, ACTION_LABEL } = require('../utils/common/constants');

const countryCodeRepository = new CountryCodeRepository();
const userJourneyRepo = new UserJourneyRepository();

async function create(req, res) {
    const bodyReq = req.body;
    const data = {
        name: bodyReq.name.trim(),
        code: bodyReq.code.trim(),
        calling_code: bodyReq.calling_code.trim()
    };

    try {
        const response = await countryCodeRepository.create(data);

        await userJourneyRepo.create({
            module_name: MODULE_LABEL.COUNTRY_CODE,
            action: ACTION_LABEL.ADD,
            created_by: req?.user?.id
        });

        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Successfully created Country Code.';

        Logger.info(`Country Code -> created successfully: ${JSON.stringify(data)}`);
        return res.status(StatusCodes.CREATED).json(SuccessRespnose);

    } catch (error) {
        Logger.error(`Country Code -> unable to create: ${JSON.stringify(data)} error: ${JSON.stringify(error)}`);

        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        if (error.name === 'SequelizeUniqueConstraintError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = `Duplicate key, record already exists for ${data.name}`;
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

        Logger.info(`Country Code -> received all successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Country Code -> unable to fetch all, error: ${JSON.stringify(error)}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function get(req, res) {
    const countryCodeId = req.params.id;

    try {
        const data = await countryCodeRepository.get(countryCodeId);

        if (!data) {
            ErrorResponse.message = `Country code not found with ID: ${countryCodeId}`;
            return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
        }

        if (data.is_deleted) {
            ErrorResponse.message = `Country code -> this country code ${countryCodeId} has been deleted`;
            ErrorResponse.data = data;
            return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
        }

        SuccessRespnose.data = data;
        Logger.info(`Country Code -> received ${countryCodeId} successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        ErrorResponse.error = error;
        ErrorResponse.message = error.message;

        Logger.error(`Country Code -> unable to get ${countryCodeId}, error: ${JSON.stringify(error)}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function updateCountryCode(req, res) {
    const countryCodeId = req.params.id;
    const bodyReq = req.body;
    const data = {
        name: bodyReq.name.trim(),
        code: bodyReq.code.trim(),
        calling_code: bodyReq.calling_code.trim()
    };

    try {
        const response = await countryCodeRepository.update(countryCodeId, data);

        await userJourneyRepo.create({
            module_name: MODULE_LABEL.COUNTRY_CODE,
            action: ACTION_LABEL.EDIT,
            created_by: req?.user?.id
        });

        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Updated successfully';

        Logger.info(`Country Code -> ${countryCodeId} updated successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        if (error.name === 'SequelizeUniqueConstraintError') {
            statusCode = StatusCodes.BAD_REQUEST;
            errorMsg = `Duplicate key, record already exists for ${data.name}`;
        }

        ErrorResponse.error = error;
        ErrorResponse.message = errorMsg;

        Logger.error(`Country Code -> unable to update ${countryCodeId}, error: ${JSON.stringify(error)}`);
        return res.status(statusCode).json(ErrorResponse);
    }
}

async function deleteCountryCode(req, res) {
    const ids = req.body.countryCodeIds;

    try {
        const response = await countryCodeRepository.deleteMany(ids);

        await userJourneyRepo.create({
            module_name: MODULE_LABEL.COUNTRY_CODE,
            action: ACTION_LABEL.DELETE,
            created_by: req?.user?.id
        });

        SuccessRespnose.message = 'Deleted successfully!';
        SuccessRespnose.data = response;

        Logger.info(`Country Code -> ${ids} deleted successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {
        ErrorResponse.error = error;
        ErrorResponse.message = error.message;

        Logger.error(`Country Code -> unable to delete, error: ${JSON.stringify(error)}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

module.exports = {
    create,
    getAll,
    get,
    updateCountryCode,
    deleteCountryCode
};
