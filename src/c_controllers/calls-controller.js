const { StatusCodes } = require("http-status-codes");
const {CallsRepository, UserJourneyRepository } = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const { MODULE_LABEL, ACTION_LABEL } = require('../../shared/utils/common/constants');
const { Logger } = require("../../shared/config");
const callsRepo = new CallsRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createCalls(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};

    const call = await callsRepo.create(bodyReq.calls);
    responseData.call = call;

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.CALLS,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
    });

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new call";

    Logger.info(`Calls -> created successfully: ${JSON.stringify(responseData)}`);

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);

  } catch (error) {
    Logger.error(`Calls -> unable to create call: ${JSON.stringify(error.message)}`);

    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    const data = await callsRepo.getAll(req.user.id);

    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Calls -> received all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    Logger.error(`Calls -> unable to get calls list, error: ${error.message}`);

    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  createCalls,
  getAll
};
