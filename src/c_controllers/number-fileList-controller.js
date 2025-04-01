

const { StatusCodes } = require("http-status-codes");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const {NumberFileListRepository} = require("../c_repositories")
const { Logger } = require("../config");


const numberFileListRepo = new NumberFileListRepository();

async function getAll(req, res) {
  try {
    const data = await numberFileListRepo.getAll();
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Number File List -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Number File List -> unable to get Number File List, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


module.exports={getAll}