const { StatusCodes } = require("http-status-codes");
const { IncomingReportRepository,
  IncomingReportMayW1Repository,
  IncomingReportMayW2Repository,
  IncomingReportMayW3Repository,
  IncomingReportMayW4Repository,
  IncomingReportJuneW1Repository,
  IncomingReportJuneW2Repository,
  IncomingReportJuneW3Repository,
  IncomingReportJuneW4Repository,
 } = require("../../shared/c_repositories");
const {SuccessRespnose , ErrorResponse} = require("../../shared/utils/common");
const AppError = require("../../shared/utils/errors/app-error");
const { Logger } = require("../../shared/config");
const incomingReportRepo = new IncomingReportRepository();
const moment = require('moment');

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

      const repositories = {
          Mayw1: new IncomingReportMayW1Repository(),
          Mayw2: new IncomingReportMayW2Repository(),
          Mayw3: new IncomingReportMayW3Repository(),
          Mayw4: new IncomingReportMayW4Repository(),
          Junew1: new IncomingReportJuneW1Repository(),
          Junew2: new IncomingReportJuneW2Repository(),
          Junew3: new IncomingReportJuneW3Repository(),
          Junew4: new IncomingReportJuneW4Repository(),
      };

      const dateStart = moment(startDate);
      const startDateMonthName = dateStart.format('MMMM');
      let startDateWeekNumber;
      const startDateDay = dateStart.date();

      if (startDateDay <= 7) {
        startDateWeekNumber = 1;
      } else if (startDateDay <= 14) {
        startDateWeekNumber = 2;
      } else if (startDateDay <= 21) {
        startDateWeekNumber = 3;
      } else {
        startDateWeekNumber = 4;
      }

      const dateEnd = moment(endDate);
      const endDateMonthName = dateEnd.format('MMMM');
      let endDateWeekNumber;
      const endDateDay = dateEnd.date();

      if (endDateDay <= 7) {
        endDateWeekNumber = 1;
      } else if (endDateDay <= 14) {
        endDateWeekNumber = 2;
      } else if (endDateDay <= 21) {
        endDateWeekNumber = 3;
      } else {
        endDateWeekNumber = 4;
      }

      if (startDateMonthName !== endDateMonthName) {
        ErrorResponse.message = 'You can check only 1 month data';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }

      const weekDeff = endDateWeekNumber - startDateWeekNumber
      let finalData

      if (weekDeff == 0) {
        const model = `${startDateMonthName}w${startDateWeekNumber}`
        const repo = repositories[model];
        finalData = await repo.getByDidByDate({callee_number : did}, startDate, endDate);

      } else if (weekDeff == 1) {
        //data from startDate week
        const model1 = `${startDateMonthName}w${startDateWeekNumber}`
        const repo1 = repositories[model1];
        const data1 = await repo1.getByDidByStartDate({callee_number : did}, startDate);

        //data from endDate week
        const model2 = `${endDateMonthName}w${endDateWeekNumber}`
        const repo2 = repositories[model2];
        const data2 = await repo2.getByDidByEndDate({callee_number : did}, endDate);

        finalData = [...data1, ...data2]
      } else {
        const allData = [];

        for (let week = startDateWeekNumber; week <= endDateWeekNumber; week++) {
          const modelKey = `${startDateMonthName}w${week}`;
          const repo = repositories[modelKey];

          if (!repo) continue;

          if (week === startDateWeekNumber) {
            const data = await repo.getByDidByStartDate({ callee_number: did }, startDate);
            allData.push(...data);
          } else if (week === endDateWeekNumber) {
            const data = await repo.getByDidByEndDate({ callee_number: did }, endDate);
            allData.push(...data);
          } else {
            const data = await repo.getByDidByDate({ callee_number: did });
            allData.push(...data);
          }
        }

        finalData = allData;
      }


      SuccessRespnose.data = finalData;
      SuccessRespnose.message = "Success";
  
      Logger.info(
        `Download Report -> recieved all successfully`
      );
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      console.log('error', error)
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
  
      Logger.error(
        `Download Report -> unable to get server list, error: ${JSON.stringify(error)}`
      );
  
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }


module.exports = {createIncomingReport, getAll, getById, updateIncomingReport, deleteIncomingReport, getDidSpecificReport};
