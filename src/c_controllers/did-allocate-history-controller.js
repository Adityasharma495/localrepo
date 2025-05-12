const { StatusCodes } = require("http-status-codes");
const { DidAllocateHistoryRepository, CompanyRepository,CallCentreRepository, UserRepository } = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse} = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");

const didAllocateHistoryRepo = new DidAllocateHistoryRepository();
const companyRepo = new CompanyRepository();
const callCentreRepo = new CallCentreRepository();
const userRepo = new UserRepository();

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
    let data = await didAllocateHistoryRepo.getAll();
    data = data.map((val) => val.toJSON());

    data = await Promise.all(
      data.map(async (val) => {
        let finalData = { name: '', id: null };
    
        if (val.to_user) {
          let allocatedData = null;
    
          if ([1, 2, 3].includes(Number(val.level))) {
            allocatedData = await userRepo.get(Number(val.to_user));

            if (allocatedData) {
              finalData = { name: allocatedData.username, id: allocatedData.id };
            }
          } else if (val.level == 4) {
            allocatedData = await companyRepo.findOne({ id: Number(val.to_user) });
            if (allocatedData) {
              finalData = { name: allocatedData.name, id: allocatedData.id };
            }
          } else if (val.level == 5) {
            allocatedData = await callCentreRepo.findOne({ id: Number(val.to_user) });
            if (allocatedData) {
              finalData = { name: allocatedData.name, id: allocatedData.id };
            }
          }
        }

        val.toUser = finalData;
        return val;
      })
    );

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
