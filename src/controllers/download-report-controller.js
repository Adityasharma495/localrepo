const { StatusCodes } = require("http-status-codes");
const { DownloadReportRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const { Logger } = require("../config");
const constant = require('../utils/common/constants')

const downloadReportRepo = new DownloadReportRepository();

async function createDownloadReport(req, res) {
    const bodyReq = req.body;

    try {
      const responseData = {};
      const getData = await downloadReportRepo.findOne({
        user_id : bodyReq.user_id,
        did:  bodyReq.did,
        status: 0
      })

      if (getData) {
        return res.status(StatusCodes.CREATED).json({
          data: responseData,
          message: "Entry Already Presnet"
        });
      }

      bodyReq.created_by = req.user.id
      const report = await downloadReportRepo.create(bodyReq);

      responseData.downloadReport = report;
  
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
      const userId = req.user.role === constant.USERS_ROLE.CALLCENTRE_AGENT ? null : req.user.id
      const data = await downloadReportRepo.getAll(userId);
      SuccessRespnose.data = data;
      SuccessRespnose.message = "Success";

      Logger.info(
        `Download Report -> recieved all successfully`
      );
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
  
      Logger.error(
        `Download Report -> unable to get server list, error: ${JSON.stringify(error)}`
      );
  
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}


module.exports = {createDownloadReport, getAll};
