const { StatusCodes } = require("http-status-codes");
const { CodecsRepository } = require("../../shared/c_repositories");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");

const codecRepo = new CodecsRepository();

async function getAll(req, res) {
  try {
    const response = await codecRepo.getAll();

    SuccessRespnose.message = "Success";
    SuccessRespnose.data = response

    Logger.info(`User -> recieved all codecs list`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log("error here", error);
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `User -> unable to get codecs list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  getAll,
};
