const { StatusCodes } = require('http-status-codes');
const { SuccessRespnose, ErrorResponse } = require('../utils/common');
const constant = require('../utils/common/constants')
const { Logger } = require('../config');
const { IncomingSummaryRepository } = require('../repositories');
const incomingSummaryRepo = new IncomingSummaryRepository();


async function getAll(req, res) {

    try {

        const userId = req.user.role === constant.USERS_ROLE.CALLCENTRE_AGENT ? null : req.user.id

        const data = await incomingSummaryRepo.getAll(userId);
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