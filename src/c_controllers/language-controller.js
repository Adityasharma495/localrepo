const { StatusCodes } = require("http-status-codes");
const { LanguageRepository } = require("../../shared/c_repositories");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");

const languageRepo = new LanguageRepository();

async function getAll(req, res) {
  try {
    const response = await languageRepo.getAll();

    SuccessRespnose.message = "Success";
    SuccessRespnose.data = response

    Logger.info(`Language -> recieved all languages list`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log("error ", error);
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Language -> unable to get Languages list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  getAll,
};
