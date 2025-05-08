const { StatusCodes } = require("http-status-codes");
const { DidRemoveHistoryRepository} = require("../c_repositories");
const { SuccessRespnose, ErrorResponse} = require("../utils/common");
const { Logger } = require("../config");

const didRemoveHistoryRepo = new DidRemoveHistoryRepository();

async function create(req, res) {
  const bodyReq = req.body;
  try {
    const responseData = {};

    const didRemovePayload = {
      ...bodyReq.did_remove,
    };

    const didRemove = await didRemoveHistoryRepo.create(didRemovePayload);

    responseData.didRemove = didRemove;

    const SuccessResponse = {
      data: responseData,
      message: "Successfully Added a new entry in DID Remove history",
    };

    Logger.info(
      `DID Remove history -> created successfully: ${JSON.stringify(responseData)}`
    );
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log("error", error);
    Logger.error(
      `DID Remove history -> unable to create: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error)
      )}`
    );

    const ErrorResponse = {
      message: 'DID Remove history -> unable to create',
      error: error,
    };

    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    const data = await didRemoveHistoryRepo.getAll();
    SuccessRespnose.data = data
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `DID Remove history -> unable to get DID Remove history list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  create,
  getAll,
};
