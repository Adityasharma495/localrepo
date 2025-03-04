const { StatusCodes } = require("http-status-codes");
const { UserJourneyRepository } = require("../c_repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const { Logger } = require("../config");
const userJourneyRepo = new UserJourneyRepository();

async function getAll(req, res) {
  console.log("hit get request for user journey");
  try {
    const data = await userJourneyRepo.getAll(req.user.id, req.user.role);
    SuccessRespnose.data = data;
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
