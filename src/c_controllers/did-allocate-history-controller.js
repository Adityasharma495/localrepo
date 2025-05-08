const { StatusCodes } = require("http-status-codes");
const { DidAllocateHistoryRepository} = require("../c_repositories");
const { SuccessRespnose, ErrorResponse} = require("../utils/common");
const { Logger } = require("../config");

const didAllocateHistoryRepo = new DidAllocateHistoryRepository();

async function create(req, res) {
  const bodyReq = req.body;
  try {
    const responseData = {};

    const didAllocatePayload = {
      ...bodyReq.did_allocate,
    };

    const didAllocate = await didAllocateHistoryRepo.create(didAllocatePayload);

    responseData.didAllocate = didAllocate;

    const SuccessResponse = {
      data: responseData,
      message: "Successfully Added a new entry in DID allocate history",
    };

    Logger.info(
      `DID Allocate history -> created successfully: ${JSON.stringify(responseData)}`
    );
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log("error", error);
    Logger.error(
      `DID Allocate history -> unable to create: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error)
      )}`
    );

    const ErrorResponse = {
      message: 'DID Allocate history -> unable to create',
      error: error,
    };

    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    const data = await didAllocateHistoryRepo.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = data
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `DID Allocate history -> unable to get DID Allocate history list, error: ${JSON.stringify(
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
