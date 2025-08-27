const { StatusCodes } = require("http-status-codes");
const { ScriptRepository } = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");
const scriptRepo = new ScriptRepository();

async function getAll(req, res) {
  try {
    const data = await scriptRepo.getAll({
      where: {
        created_by: req.user.id,
      },
    });
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Scripts -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Scripts -> unable to get scripts list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  getAll,
};
