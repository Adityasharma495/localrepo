const { StatusCodes } = require("http-status-codes");
const { NumberFileListRepository, NumbersRepository, UserJourneyRepository} = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const { Logger } = require("../config");
const numberFileListRepo = new NumberFileListRepository();
const numberRepo = new NumbersRepository();
const userJourneyRepo = new UserJourneyRepository();

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


async function deleteNumberFile(req, res) {
  const id = req.body.fileListIds;

  try {
    const response = await numberFileListRepo.deleteMany(id);

    // delete number with related to these files from numbers collection
    await numberRepo.deleteNumberByFileId(id);

    const userJourneyfields = {
      module_name: MODULE_LABEL.NUMBER_FILE_LIST,
      action: ACTION_LABEL.DELETE,
      createdBy: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Number File List -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Number File not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Number File List -> unable to delete Number File: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  getAll,
  deleteNumberFile
};
