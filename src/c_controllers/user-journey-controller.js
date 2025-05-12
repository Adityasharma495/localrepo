const { StatusCodes } = require("http-status-codes");
const { UserJourneyRepository } = require("../../shared/c_repositories");
const {SuccessRespnose , ErrorResponse, ResponseFormatter} = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");
const userJourneyRepo = new UserJourneyRepository();

const version = process.env.API_V || '1';

async function getAll(req, res) {
  try {
    const data = await userJourneyRepo.getAll(req.user.id, req.user.role);
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(data, version);
    SuccessRespnose.message = "Success";

    Logger.error(
      `User journey -> recieved all successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `User journey -> unable to get User journey, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


module.exports = {
  getAll,
};
