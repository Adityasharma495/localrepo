const { StatusCodes } = require("http-status-codes");
const { DownloadReportRepository } = require("../c_repositories");
const {
  SuccessRespnose,
  ErrorResponse,
  ResponseFormatter,
} = require("../utils/common");
const { Logger } = require("../config");
const downloadReportRepo = new DownloadReportRepository();

const version = process.env.API_V || "1";

// const { constants } = require("../utils/common");

async function createDownloadReport(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};
    const getData = await downloadReportRepo.findOne({
      user_id: bodyReq.user_id,
      did: bodyReq.did,
    });

    if (getData) {
      return res.status(StatusCodes.CREATED).json({
        data: responseData,
        message: "Entry Already Presnet",
      });
    }

    bodyReq.created_by = req.user.id;
    const report = await downloadReportRepo.create(bodyReq);

    responseData.downloadReport = ResponseFormatter.formatResponseIds(
      report,
      version
    );

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a Download Report";

    Logger.info(
      `Download Report -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Download Report -> unable to create Download Report: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode;
    let errorMsg = error.message;
    if (error.name == "MongoServerError" || error.code == 11000) {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == "DuplicateKey")
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    // const data = await downloadReportRepo.getAll(constants.USERS_ROLE.SUPER_ADMIN, req.user.id);
    const data = await downloadReportRepo.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(data, version);
    SuccessRespnose.message = "Success";

    Logger.info(`Download Report -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Download Report -> unable to get server list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = { createDownloadReport, getAll };
