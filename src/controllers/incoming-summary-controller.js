const { StatusCodes } = require('http-status-codes');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const { Logger } = require('../config');
const { IncomingSummaryRepository } = require('../repositories');
const incomingSummaryRepo = new IncomingSummaryRepository();


async function getAll(req, res) {

    try {

        const data = await incomingSummaryRepo.getAll(req.user.id);
        SuccessRespnose.data = data;
        SuccessRespnose.message = 'Success';

        Logger.info(`Incoming Summary -> recieved all successfully`);

        return res.status(StatusCodes.OK).json(SuccessRespnose);

    } catch (error) {

        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(`Incoming Summary -> unable to get Incoming Summary list, error: ${JSON.stringify(error)}`);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);

    }

}

module.exports = {
    getAll,
}