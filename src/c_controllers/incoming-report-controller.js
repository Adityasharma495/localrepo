const { StatusCodes } = require("http-status-codes");
const { IncomingReportRepository } = require("../c_repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const { Logger } = require("../config");
const incomingReportRepo = new IncomingReportRepository();

async function createIncomingReport(req, res) {
    const bodyReq = req.body;
    try {
      const responseData = {};
      const report = await incomingReportRepo.create(bodyReq.incomingReport);

      responseData.incomingReport = report;
  
      SuccessRespnose.data = responseData;
      SuccessRespnose.message = "Successfully created a Incoming Report";
  
      Logger.info(
        `Incoming Report -> created successfully: ${JSON.stringify(responseData)}`
      );
  
      return res.status(StatusCodes.CREATED).json(SuccessRespnose);
    } catch (error) {
      Logger.error(
        `Incoming Report -> unable to create Incoming Report: ${JSON.stringify(
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
      const data = await incomingReportRepo.getAll(req.user.role, req.user.id);
      SuccessRespnose.data = data;
      SuccessRespnose.message = "Success";

      Logger.info(
        `Incoming Report -> recieved all successfully`
      );
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
  
      Logger.error(
        `Incoming Report -> unable to get server list, error: ${JSON.stringify(error)}`
      );
  
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}
  
async function getById(req, res) {
    const id = req.params.id;
  
    try {
      if (!id) {
        throw new AppError("Missing Incoming Report Id", StatusCodes.BAD_REQUEST);
       }
      const incomingReportData = await incomingReportRepo.get(id);
      if (incomingReportData.length == 0) {
        const error = new Error();
        error.name = 'CastError';
        throw error;
      }
      SuccessRespnose.message = "Success";
      SuccessRespnose.data = incomingReportData;

      Logger.info(
        `Incoming Report -> recieved ${id} successfully`
      );
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name == "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "Incoming Report not found";
      }
      ErrorResponse.message = errorMsg;
  
      Logger.error(
        `Incoming Report -> unable to get Incoming Report ${id}, error: ${JSON.stringify(error)}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
}

async function updateIncomingReport(req, res) {
    const uid = req.params.id;
    const bodyReq = req.body;
    try {
  
      const responseData = {};
      const incomingReport = await incomingReportRepo.update(uid, bodyReq.incomingReport);
      if (!incomingReport) {
        const error = new Error();
        error.name = 'CastError';
        throw error;
      }
      responseData.incomingReport = incomingReport;

      SuccessRespnose.message = 'Updated successfully!';
      SuccessRespnose.data = responseData;
  
      Logger.info(`Incoming Report -> ${uid} updated successfully`);
      return res.status(StatusCodes.OK).json(SuccessRespnose);
  
    } catch (error) {
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  
      if (error.name == 'CastError') {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = 'Incoming Report not found';
      }
      else if (error.name == 'MongoServerError') {
        statusCode = StatusCodes.BAD_REQUEST;
        if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
      ErrorResponse.message = errorMsg;
  
      Logger.error(`Incoming Report-> unable to update Incoming Report: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);
  
      return res.status(statusCode).json(ErrorResponse);
  
    }
}

async function deleteIncomingReport(req, res) {
    const idArray = req.body.reportIds;
  
    try {
      const response = await incomingReportRepo.deleteMany(idArray);
      
      SuccessRespnose.message = "Deleted successfully!";
      SuccessRespnose.data = response;
  
      Logger.info(`Incoming Report -> ${idArray} deleted successfully`);
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
  
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name == "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "Incoming Report not found";
      }
      ErrorResponse.message = errorMsg;
  
      Logger.error(
        `Incoming Report -> unable to delete Incoming Report: ${idArray}, error: ${JSON.stringify(error)}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }

  async function getDidSpecificReport(req, res) {
    try {
      const {did, startDate, endDate} = req.params;
      const data = await incomingReportRepo.getByDidByDate({callee_number : did}, startDate, endDate);
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


module.exports = {createIncomingReport, getAll, getById, updateIncomingReport, deleteIncomingReport, getDidSpecificReport};
