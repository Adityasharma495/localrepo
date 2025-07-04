const { StatusCodes } = require("http-status-codes");

const { IncomingReportRepository,
  IncomingReportJanuaryW1Repository, IncomingReportJanuaryW2Repository, IncomingReportJanuaryW3Repository, IncomingReportJanuaryW4Repository,
  IncomingReportFebruaryW1Repository, IncomingReportFebruaryW2Repository, IncomingReportFebruaryW3Repository, IncomingReportFebruaryW4Repository,
  IncomingReportMarchW1Repository, IncomingReportMarchW2Repository, IncomingReportMarchW3Repository, IncomingReportMarchW4Repository,
  IncomingReportAprilW1Repository, IncomingReportAprilW2Repository, IncomingReportAprilW3Repository, IncomingReportAprilW4Repository,
  IncomingReportMayW1Repository, IncomingReportMayW2Repository, IncomingReportMayW3Repository, IncomingReportMayW4Repository,
  IncomingReportJuneW1Repository, IncomingReportJuneW2Repository, IncomingReportJuneW3Repository, IncomingReportJuneW4Repository,
  IncomingReportJulyW1Repository, IncomingReportJulyW2Repository, IncomingReportJulyW3Repository, IncomingReportJulyW4Repository,
  IncomingReportAugustW1Repository, IncomingReportAugustW2Repository, IncomingReportAugustW3Repository, IncomingReportAugustW4Repository,
  IncomingReportSeptemberW1Repository, IncomingReportSeptemberW2Repository, IncomingReportSeptemberW3Repository, IncomingReportSeptemberW4Repository,
  IncomingReportOctoberW1Repository, IncomingReportOctoberW2Repository, IncomingReportOctoberW3Repository, IncomingReportOctoberW4Repository,
  IncomingReportNovemberW1Repository, IncomingReportNovemberW2Repository, IncomingReportNovemberW3Repository, IncomingReportNovemberW4Repository,
  IncomingReportDecemberW1Repository, IncomingReportDecemberW2Repository, IncomingReportDecemberW3Repository, IncomingReportDecemberW4Repository,
  UserRepository,
  AgentRepository,
} = require("../../shared/c_repositories");

const {
  OutboundReportJanuaryW1Repository, OutboundReportJanuaryW2Repository, OutboundReportJanuaryW3Repository, OutboundReportJanuaryW4Repository,
  OutboundReportFebruaryW1Repository, OutboundReportFebruaryW2Repository, OutboundReportFebruaryW3Repository, OutboundReportFebruaryW4Repository,
  OutboundReportMarchW1Repository, OutboundReportMarchW2Repository, OutboundReportMarchW3Repository, OutboundReportMarchW4Repository,
  OutboundReportAprilW1Repository, OutboundReportAprilW2Repository, OutboundReportAprilW3Repository, OutboundReportAprilW4Repository,
  OutboundReportMayW1Repository, OutboundReportMayW2Repository, OutboundReportMayW3Repository, OutboundReportMayW4Repository,
  OutboundReportJuneW1Repository, OutboundReportJuneW2Repository, OutboundReportJuneW3Repository, OutboundReportJuneW4Repository,
  OutboundReportJulyW1Repository, OutboundReportJulyW2Repository, OutboundReportJulyW3Repository, OutboundReportJulyW4Repository,
  OutboundReportAugustW1Repository, OutboundReportAugustW2Repository, OutboundReportAugustW3Repository, OutboundReportAugustW4Repository,
  OutboundReportSeptemberW1Repository, OutboundReportSeptemberW2Repository, OutboundReportSeptemberW3Repository, OutboundReportSeptemberW4Repository,
  OutboundReportOctoberW1Repository, OutboundReportOctoberW2Repository, OutboundReportOctoberW3Repository, OutboundReportOctoberW4Repository,
  OutboundReportNovemberW1Repository, OutboundReportNovemberW2Repository, OutboundReportNovemberW3Repository, OutboundReportNovemberW4Repository,
  OutboundReportDecemberW1Repository, OutboundReportDecemberW2Repository, OutboundReportDecemberW3Repository, OutboundReportDecemberW4Repository
} = require("../../shared/c_repositories");

const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const AppError = require("../../shared/utils/errors/app-error");
const { Logger } = require("../../shared/config");
const incomingReportRepo = new IncomingReportRepository();
const userRepo = new UserRepository();

const moment = require('moment');
const { USERS_ROLE } = require("../../shared/utils/common/constants");

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

// async function getDidSpecificReport(req, res) {
//   try {
//     const { did, startDate, endDate } = req.params;

//     console.log(req.params, "PARAMS")

//     const InboundRepositories = {
//       Januaryw1: new IncomingReportJanuaryW1Repository(), Januaryw2: new IncomingReportJanuaryW2Repository(),
//       Januaryw3: new IncomingReportJanuaryW3Repository(), Januaryw4: new IncomingReportJanuaryW4Repository(),
//       Februaryw1: new IncomingReportFebruaryW1Repository(), Februaryw2: new IncomingReportFebruaryW2Repository(),
//       Februaryw3: new IncomingReportFebruaryW3Repository(), Februaryw4: new IncomingReportFebruaryW4Repository(),
//       Marchw1: new IncomingReportMarchW1Repository(), Marchw2: new IncomingReportMarchW2Repository(),
//       Marchw3: new IncomingReportMarchW3Repository(), Marchw4: new IncomingReportMarchW4Repository(),
//       Aprilw1: new IncomingReportAprilW1Repository(), Aprilw2: new IncomingReportAprilW2Repository(),
//       Aprilw3: new IncomingReportAprilW3Repository(), Aprilw4: new IncomingReportAprilW4Repository(),
//       Mayw1: new IncomingReportMayW1Repository(), Mayw2: new IncomingReportMayW2Repository(),
//       Mayw3: new IncomingReportMayW3Repository(), Mayw4: new IncomingReportMayW4Repository(),
//       Junew1: new IncomingReportJuneW1Repository(), Junew2: new IncomingReportJuneW2Repository(),
//       Junew3: new IncomingReportJuneW3Repository(), Junew4: new IncomingReportJuneW4Repository(),
//       Julyw1: new IncomingReportJulyW1Repository(), Julyw2: new IncomingReportJulyW2Repository(),
//       Julyw3: new IncomingReportJulyW3Repository(), Julyw4: new IncomingReportJulyW4Repository(),
//       Augustw1: new IncomingReportAugustW1Repository(), Augustw2: new IncomingReportAugustW2Repository(),
//       Augustw3: new IncomingReportAugustW3Repository(), Augustw4: new IncomingReportAugustW4Repository(),
//       Septemberw1: new IncomingReportSeptemberW1Repository(), Septemberw2: new IncomingReportSeptemberW2Repository(),
//       Septemberw3: new IncomingReportSeptemberW3Repository(), Septemberw4: new IncomingReportSeptemberW4Repository(),
//       Octoberw1: new IncomingReportOctoberW1Repository(), Octoberw2: new IncomingReportOctoberW2Repository(),
//       Octoberw3: new IncomingReportOctoberW3Repository(), Octoberw4: new IncomingReportOctoberW4Repository(),
//       Novemberw1: new IncomingReportNovemberW1Repository(), Novemberw2: new IncomingReportNovemberW2Repository(),
//       Novemberw3: new IncomingReportNovemberW3Repository(), Novemberw4: new IncomingReportNovemberW4Repository(),
//       Decemberw1: new IncomingReportDecemberW1Repository(), Decemberw2: new IncomingReportDecemberW2Repository(),
//       Decemberw3: new IncomingReportDecemberW3Repository(), Decemberw4: new IncomingReportDecemberW4Repository(),
//     };

//     const OutboundRepositories = {
//       Januaryw1: new OutboundReportJanuaryW1Repository(), Januaryw2: new OutboundReportJanuaryW2Repository(),
//       Januaryw3: new OutboundReportJanuaryW3Repository(), Januaryw4: new OutboundReportJanuaryW4Repository(),

//       Februaryw1: new OutboundReportFebruaryW1Repository(), Februaryw2: new OutboundReportFebruaryW2Repository(),
//       Februaryw3: new OutboundReportFebruaryW3Repository(), Februaryw4: new OutboundReportFebruaryW4Repository(),

//       Marchw1: new OutboundReportMarchW1Repository(), Marchw2: new OutboundReportMarchW2Repository(),
//       Marchw3: new OutboundReportMarchW3Repository(), Marchw4: new OutboundReportMarchW4Repository(),

//       Aprilw1: new OutboundReportAprilW1Repository(), Aprilw2: new OutboundReportAprilW2Repository(),
//       Aprilw3: new OutboundReportAprilW3Repository(), Aprilw4: new OutboundReportAprilW4Repository(),

//       Mayw1: new OutboundReportMayW1Repository(), Mayw2: new OutboundReportMayW2Repository(),
//       Mayw3: new OutboundReportMayW3Repository(), Mayw4: new OutboundReportMayW4Repository(),

//       Junew1: new OutboundReportJuneW1Repository(), Junew2: new OutboundReportJuneW2Repository(),
//       Junew3: new OutboundReportJuneW3Repository(), Junew4: new OutboundReportJuneW4Repository(),

//       Julyw1: new OutboundReportJulyW1Repository(), Julyw2: new OutboundReportJulyW2Repository(),
//       Julyw3: new OutboundReportJulyW3Repository(), Julyw4: new OutboundReportJulyW4Repository(),

//       Augustw1: new OutboundReportAugustW1Repository(), Augustw2: new OutboundReportAugustW2Repository(),
//       Augustw3: new OutboundReportAugustW3Repository(), Augustw4: new OutboundReportAugustW4Repository(),

//       Septemberw1: new OutboundReportSeptemberW1Repository(), Septemberw2: new OutboundReportSeptemberW2Repository(),
//       Septemberw3: new OutboundReportSeptemberW3Repository(), Septemberw4: new OutboundReportSeptemberW4Repository(),

//       Octoberw1: new OutboundReportOctoberW1Repository(), Octoberw2: new OutboundReportOctoberW2Repository(),
//       Octoberw3: new OutboundReportOctoberW3Repository(), Octoberw4: new OutboundReportOctoberW4Repository(),

//       Novemberw1: new OutboundReportNovemberW1Repository(), Novemberw2: new OutboundReportNovemberW2Repository(),
//       Novemberw3: new OutboundReportNovemberW3Repository(), Novemberw4: new OutboundReportNovemberW4Repository(),

//       Decemberw1: new OutboundReportDecemberW1Repository(), Decemberw2: new OutboundReportDecemberW2Repository(),
//       Decemberw3: new OutboundReportDecemberW3Repository(), Decemberw4: new OutboundReportDecemberW4Repository()
//     };


//     const dateStart = moment(startDate);
//     console.log("DATAE START", dateStart);

//     const startDateMonthName = dateStart.format('MMMM');
//     console.log("MONTH NAME ", startDateMonthName);

//     let startDateWeekNumber;
//     const startDateDay = dateStart.date();
//     console.log("START DATE ", startDateDay);


//     if (startDateDay <= 7) {
//       startDateWeekNumber = 1;
//     } else if (startDateDay <= 14) {
//       startDateWeekNumber = 2;
//     } else if (startDateDay <= 21) {
//       startDateWeekNumber = 3;
//     } else {
//       startDateWeekNumber = 4;
//     }


//     console.log("START DATE WEEK NUMBER", startDateWeekNumber);

//     const dateEnd = moment(endDate);
//     const endDateMonthName = dateEnd.format('MMMM');
//     let endDateWeekNumber;
//     const endDateDay = dateEnd.date();

//     if (endDateDay <= 7) {
//       endDateWeekNumber = 1;
//     } else if (endDateDay <= 14) {
//       endDateWeekNumber = 2;
//     } else if (endDateDay <= 21) {
//       endDateWeekNumber = 3;
//     } else {
//       endDateWeekNumber = 4;
//     }

//     console.log("END DATE WEEK NUMBER", endDateWeekNumber);

//     if (startDateMonthName !== endDateMonthName) {
//       ErrorResponse.message = 'You can check only 1 month data';
//       return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//     }

//     const weekDeff = endDateWeekNumber - startDateWeekNumber


//     let finalData

//     if (weekDeff == 0) {
//       const model = `${startDateMonthName}w${startDateWeekNumber}`
//       console.log("MODEL", model);
//       const repo = InboundRepositories[model];

//       console.log("REPO", repo);
//       finalData = await repo.getByDidByDate({ callee_number: did }, startDate, endDate);

//     } else if (weekDeff == 1) {
//       //data from startDate week
//       const model1 = `${startDateMonthName}w${startDateWeekNumber}`
//       const repo1 = InboundRepositories[model1];
//       const data1 = await repo1.getByDidByStartDate({ callee_number: did }, startDate);

//       //data from endDate week
//       const model2 = `${endDateMonthName}w${endDateWeekNumber}`
//       const repo2 = InboundRepositories[model2];
//       const data2 = await repo2.getByDidByEndDate({ callee_number: did }, endDate);

//       finalData = [...data1, ...data2]
//     } else {
//       const allData = [];

//       for (let week = startDateWeekNumber; week <= endDateWeekNumber; week++) {
//         const modelKey = `${startDateMonthName}w${week}`;
//         const repo = InboundRepositories[modelKey];

//         if (!repo) continue;

//         if (week === startDateWeekNumber) {
//           const data = await repo.getByDidByStartDate({ callee_number: did }, startDate);
//           allData.push(...data);
//         } else if (week === endDateWeekNumber) {
//           const data = await repo.getByDidByEndDate({ callee_number: did }, endDate);
//           allData.push(...data);
//         } else {
//           const data = await repo.getByDidByDate({ callee_number: did });
//           allData.push(...data);
//         }
//       }

//       finalData = allData;
//     }


//     SuccessRespnose.data = finalData;
//     SuccessRespnose.message = "Success";

//     Logger.info(
//       `Download Report -> recieved all successfully`
//     );

//     return res.status(StatusCodes.OK).json(SuccessRespnose);
//   } catch (error) {
//     console.log('error', error)
//     ErrorResponse.message = error.message;
//     ErrorResponse.error = error;

//     Logger.error(
//       `Download Report -> unable to get server list, error: ${JSON.stringify(error)}`
//     );

//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
//   }
// }


async function getAllDescendantUserIdsRecursive(userId, collected = new Set()) {
  // Skip super admin from being collected
  collected.add(userId.toString());

  const children = await userRepo.findAll({ created_by: userId });

  for (const child of children) {
    // Recursively collect children
    await getAllDescendantUserIdsRecursive(child.id,collected);
  }

  return Array.from(collected);
}




async function getDidSpecificReport(req, res) {
  try {

    const { did, startDate, endDate } = req.params;

    let userIds = [req.user.id];
    const role = req.user.role

    if (role === USERS_ROLE.RESELLER || role === USERS_ROLE.COMPANY_ADMIN) {
      userIds = await getAllDescendantUserIdsRecursive(req.user.id);
    }


    const InboundRepositories = {
      Januaryw1: new IncomingReportJanuaryW1Repository(), Januaryw2: new IncomingReportJanuaryW2Repository(),
      Januaryw3: new IncomingReportJanuaryW3Repository(), Januaryw4: new IncomingReportJanuaryW4Repository(),
      Februaryw1: new IncomingReportFebruaryW1Repository(), Februaryw2: new IncomingReportFebruaryW2Repository(),
      Februaryw3: new IncomingReportFebruaryW3Repository(), Februaryw4: new IncomingReportFebruaryW4Repository(),
      Marchw1: new IncomingReportMarchW1Repository(), Marchw2: new IncomingReportMarchW2Repository(),
      Marchw3: new IncomingReportMarchW3Repository(), Marchw4: new IncomingReportMarchW4Repository(),
      Aprilw1: new IncomingReportAprilW1Repository(), Aprilw2: new IncomingReportAprilW2Repository(),
      Aprilw3: new IncomingReportAprilW3Repository(), Aprilw4: new IncomingReportAprilW4Repository(),
      Mayw1: new IncomingReportMayW1Repository(), Mayw2: new IncomingReportMayW2Repository(),
      Mayw3: new IncomingReportMayW3Repository(), Mayw4: new IncomingReportMayW4Repository(),
      Junew1: new IncomingReportJuneW1Repository(), Junew2: new IncomingReportJuneW2Repository(),
      Junew3: new IncomingReportJuneW3Repository(), Junew4: new IncomingReportJuneW4Repository(),
      Julyw1: new IncomingReportJulyW1Repository(), Julyw2: new IncomingReportJulyW2Repository(),
      Julyw3: new IncomingReportJulyW3Repository(), Julyw4: new IncomingReportJulyW4Repository(),
      Augustw1: new IncomingReportAugustW1Repository(), Augustw2: new IncomingReportAugustW2Repository(),
      Augustw3: new IncomingReportAugustW3Repository(), Augustw4: new IncomingReportAugustW4Repository(),
      Septemberw1: new IncomingReportSeptemberW1Repository(), Septemberw2: new IncomingReportSeptemberW2Repository(),
      Septemberw3: new IncomingReportSeptemberW3Repository(), Septemberw4: new IncomingReportSeptemberW4Repository(),
      Octoberw1: new IncomingReportOctoberW1Repository(), Octoberw2: new IncomingReportOctoberW2Repository(),
      Octoberw3: new IncomingReportOctoberW3Repository(), Octoberw4: new IncomingReportOctoberW4Repository(),
      Novemberw1: new IncomingReportNovemberW1Repository(), Novemberw2: new IncomingReportNovemberW2Repository(),
      Novemberw3: new IncomingReportNovemberW3Repository(), Novemberw4: new IncomingReportNovemberW4Repository(),
      Decemberw1: new IncomingReportDecemberW1Repository(), Decemberw2: new IncomingReportDecemberW2Repository(),
      Decemberw3: new IncomingReportDecemberW3Repository(), Decemberw4: new IncomingReportDecemberW4Repository(),
    };

    // const OutboundRepositories = {
    //   Januaryw1: new OutboundReportJanuaryW1Repository(), Januaryw2: new OutboundReportJanuaryW2Repository(),
    //   Januaryw3: new OutboundReportJanuaryW3Repository(), Januaryw4: new OutboundReportJanuaryW4Repository(),
    //   Februaryw1: new OutboundReportFebruaryW1Repository(), Februaryw2: new OutboundReportFebruaryW2Repository(),
    //   Februaryw3: new OutboundReportFebruaryW3Repository(), Februaryw4: new OutboundReportFebruaryW4Repository(),
    //   Marchw1: new OutboundReportMarchW1Repository(), Marchw2: new OutboundReportMarchW2Repository(),
    //   Marchw3: new OutboundReportMarchW3Repository(), Marchw4: new OutboundReportMarchW4Repository(),
    //   Aprilw1: new OutboundReportAprilW1Repository(), Aprilw2: new OutboundReportAprilW2Repository(),
    //   Aprilw3: new OutboundReportAprilW3Repository(), Aprilw4: new OutboundReportAprilW4Repository(),
    //   Mayw1: new OutboundReportMayW1Repository(), Mayw2: new OutboundReportMayW2Repository(),
    //   Mayw3: new OutboundReportMayW3Repository(), Mayw4: new OutboundReportMayW4Repository(),
    //   Junew1: new OutboundReportJuneW1Repository(), Junew2: new OutboundReportJuneW2Repository(),
    //   Junew3: new OutboundReportJuneW3Repository(), Junew4: new OutboundReportJuneW4Repository(),
    //   Julyw1: new OutboundReportJulyW1Repository(), Julyw2: new OutboundReportJulyW2Repository(),
    //   Julyw3: new OutboundReportJulyW3Repository(), Julyw4: new OutboundReportJulyW4Repository(),
    //   Augustw1: new OutboundReportAugustW1Repository(), Augustw2: new OutboundReportAugustW2Repository(),
    //   Augustw3: new OutboundReportAugustW3Repository(), Augustw4: new OutboundReportAugustW4Repository(),
    //   Septemberw1: new OutboundReportSeptemberW1Repository(), Septemberw2: new OutboundReportSeptemberW2Repository(),
    //   Septemberw3: new OutboundReportSeptemberW3Repository(), Septemberw4: new OutboundReportSeptemberW4Repository(),
    //   Octoberw1: new OutboundReportOctoberW1Repository(), Octoberw2: new OutboundReportOctoberW2Repository(),
    //   Octoberw3: new OutboundReportOctoberW3Repository(), Octoberw4: new OutboundReportOctoberW4Repository(),
    //   Novemberw1: new OutboundReportNovemberW1Repository(), Novemberw2: new OutboundReportNovemberW2Repository(),
    //   Novemberw3: new OutboundReportNovemberW3Repository(), Novemberw4: new OutboundReportNovemberW4Repository(),
    //   Decemberw1: new OutboundReportDecemberW1Repository(), Decemberw2: new OutboundReportDecemberW2Repository(),
    //   Decemberw3: new OutboundReportDecemberW3Repository(), Decemberw4: new OutboundReportDecemberW4Repository(),
    // };

    const dateStart = moment(startDate);
    const dateEnd = moment(endDate);
    const startDateMonthName = dateStart.format('MMMM');
    const endDateMonthName = dateEnd.format('MMMM');



    if (startDateMonthName !== endDateMonthName) {
      ErrorResponse.message = 'You can check only 1 month data';
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const getWeekNumber = (day) => {
      if (day <= 7) return 1;
      if (day <= 14) return 2;
      if (day <= 21) return 3;
      return 4;
    };


    const startWeek = getWeekNumber(dateStart.date());
    const endWeek = getWeekNumber(dateEnd.date());





    const finalInboundData = [];
    const finalOutboundData = [];


    for (let week = startWeek; week <= endWeek; week++) {
      const repoKey = `${startDateMonthName}w${week}`;
      const inboundRepo = InboundRepositories[repoKey];

      if (!inboundRepo) continue;

      const allUserReports = [];


      console.log("DID", did);
      console.log("START DATE", startDate);
      console.log("UID", userIds);
      console.log("ROLE", role);


      const idsToQuery = userIds || [null];
      for (const uid of idsToQuery) {
        if (week === startWeek) {
          const data = await inboundRepo.getByDidByStartDate({ callee_number: did }, startDate, uid,role);
          allUserReports.push(...data);
        } else if (week === endWeek) {
          const data = await inboundRepo.getByDidByEndDate({ callee_number: did }, endDate, uid,role);
          allUserReports.push(...data);
        } else {
          const data = await inboundRepo.getByDidByDate({ callee_number: did }, uid,role);
          allUserReports.push(...data);
        }
      }

      finalInboundData.push(...allUserReports);
    }

    const finalData = [...finalInboundData, ...finalOutboundData];


    SuccessRespnose.data = finalData
    SuccessRespnose.message = "Success";

    Logger.info(`Both Inbound and Outbound reports fetched successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    console.log('error', error);
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(`Report Fetch Failed -> ${JSON.stringify(error)}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


async function getDidSpecificReportwithTraceId(req, res) {
  try {
    let { did, startDate, endDate, trace_id } = req.params;

    const InboundRepositories = {
      Januaryw1: new IncomingReportJanuaryW1Repository(), Januaryw2: new IncomingReportJanuaryW2Repository(),
      Januaryw3: new IncomingReportJanuaryW3Repository(), Januaryw4: new IncomingReportJanuaryW4Repository(),
      Februaryw1: new IncomingReportFebruaryW1Repository(), Februaryw2: new IncomingReportFebruaryW2Repository(),
      Februaryw3: new IncomingReportFebruaryW3Repository(), Februaryw4: new IncomingReportFebruaryW4Repository(),
      Marchw1: new IncomingReportMarchW1Repository(), Marchw2: new IncomingReportMarchW2Repository(),
      Marchw3: new IncomingReportMarchW3Repository(), Marchw4: new IncomingReportMarchW4Repository(),
      Aprilw1: new IncomingReportAprilW1Repository(), Aprilw2: new IncomingReportAprilW2Repository(),
      Aprilw3: new IncomingReportAprilW3Repository(), Aprilw4: new IncomingReportAprilW4Repository(),
      Mayw1: new IncomingReportMayW1Repository(), Mayw2: new IncomingReportMayW2Repository(),
      Mayw3: new IncomingReportMayW3Repository(), Mayw4: new IncomingReportMayW4Repository(),
      Junew1: new IncomingReportJuneW1Repository(), Junew2: new IncomingReportJuneW2Repository(),
      Junew3: new IncomingReportJuneW3Repository(), Junew4: new IncomingReportJuneW4Repository(),
      Julyw1: new IncomingReportJulyW1Repository(), Julyw2: new IncomingReportJulyW2Repository(),
      Julyw3: new IncomingReportJulyW3Repository(), Julyw4: new IncomingReportJulyW4Repository(),
      Augustw1: new IncomingReportAugustW1Repository(), Augustw2: new IncomingReportAugustW2Repository(),
      Augustw3: new IncomingReportAugustW3Repository(), Augustw4: new IncomingReportAugustW4Repository(),
      Septemberw1: new IncomingReportSeptemberW1Repository(), Septemberw2: new IncomingReportSeptemberW2Repository(),
      Septemberw3: new IncomingReportSeptemberW3Repository(), Septemberw4: new IncomingReportSeptemberW4Repository(),
      Octoberw1: new IncomingReportOctoberW1Repository(), Octoberw2: new IncomingReportOctoberW2Repository(),
      Octoberw3: new IncomingReportOctoberW3Repository(), Octoberw4: new IncomingReportOctoberW4Repository(),
      Novemberw1: new IncomingReportNovemberW1Repository(), Novemberw2: new IncomingReportNovemberW2Repository(),
      Novemberw3: new IncomingReportNovemberW3Repository(), Novemberw4: new IncomingReportNovemberW4Repository(),
      Decemberw1: new IncomingReportDecemberW1Repository(), Decemberw2: new IncomingReportDecemberW2Repository(),
      Decemberw3: new IncomingReportDecemberW3Repository(), Decemberw4: new IncomingReportDecemberW4Repository(),
    };

    const OutboundRepositories = {
      Januaryw1: new OutboundReportJanuaryW1Repository(), Januaryw2: new OutboundReportJanuaryW2Repository(),
      Januaryw3: new OutboundReportJanuaryW3Repository(), Januaryw4: new OutboundReportJanuaryW4Repository(),
      Februaryw1: new OutboundReportFebruaryW1Repository(), Februaryw2: new OutboundReportFebruaryW2Repository(),
      Februaryw3: new OutboundReportFebruaryW3Repository(), Februaryw4: new OutboundReportFebruaryW4Repository(),
      Marchw1: new OutboundReportMarchW1Repository(), Marchw2: new OutboundReportMarchW2Repository(),
      Marchw3: new OutboundReportMarchW3Repository(), Marchw4: new OutboundReportMarchW4Repository(),
      Aprilw1: new OutboundReportAprilW1Repository(), Aprilw2: new OutboundReportAprilW2Repository(),
      Aprilw3: new OutboundReportAprilW3Repository(), Aprilw4: new OutboundReportAprilW4Repository(),
      Mayw1: new OutboundReportMayW1Repository(), Mayw2: new OutboundReportMayW2Repository(),
      Mayw3: new OutboundReportMayW3Repository(), Mayw4: new OutboundReportMayW4Repository(),
      Junew1: new OutboundReportJuneW1Repository(), Junew2: new OutboundReportJuneW2Repository(),
      Junew3: new OutboundReportJuneW3Repository(), Junew4: new OutboundReportJuneW4Repository(),
      Julyw1: new OutboundReportJulyW1Repository(), Julyw2: new OutboundReportJulyW2Repository(),
      Julyw3: new OutboundReportJulyW3Repository(), Julyw4: new OutboundReportJulyW4Repository(),
      Augustw1: new OutboundReportAugustW1Repository(), Augustw2: new OutboundReportAugustW2Repository(),
      Augustw3: new OutboundReportAugustW3Repository(), Augustw4: new OutboundReportAugustW4Repository(),
      Septemberw1: new OutboundReportSeptemberW1Repository(), Septemberw2: new OutboundReportSeptemberW2Repository(),
      Septemberw3: new OutboundReportSeptemberW3Repository(), Septemberw4: new OutboundReportSeptemberW4Repository(),
      Octoberw1: new OutboundReportOctoberW1Repository(), Octoberw2: new OutboundReportOctoberW2Repository(),
      Octoberw3: new OutboundReportOctoberW3Repository(), Octoberw4: new OutboundReportOctoberW4Repository(),
      Novemberw1: new OutboundReportNovemberW1Repository(), Novemberw2: new OutboundReportNovemberW2Repository(),
      Novemberw3: new OutboundReportNovemberW3Repository(), Novemberw4: new OutboundReportNovemberW4Repository(),
      Decemberw1: new OutboundReportDecemberW1Repository(), Decemberw2: new OutboundReportDecemberW2Repository(),
      Decemberw3: new OutboundReportDecemberW3Repository(), Decemberw4: new OutboundReportDecemberW4Repository(),
    };

    const dateStart = moment(startDate);
    const dateEnd = moment(endDate);
    const monthName = dateStart.format('MMMM');
    const day = dateStart.date();

    const getWeekNumber = (d) => (d <= 7 ? 1 : d <= 14 ? 2 : d <= 21 ? 3 : 4);
    const weekNumber = getWeekNumber(day);
    const repoKey = `${monthName}w${weekNumber}`;

    const inboundRepo = InboundRepositories[repoKey];
    const outboundRepo = OutboundRepositories[repoKey];


    did = did?.trim();
    trace_id = trace_id?.trim();


    const inboundData = inboundRepo ? await inboundRepo.getDidByTraceId(trace_id, did) : [];
    const outboundData = outboundRepo ? await outboundRepo.getDidByTraceId(trace_id) : [];
    
    const calleeNumbers = outboundData.map(item => item.dataValues.callee_number);

    const agentRepo = new AgentRepository();
    const agentList = await agentRepo.findAll({ agent_number: calleeNumbers });
    


const enrichedOutboundData = outboundData.map(outbound => {
  const callee = outbound.dataValues.callee_number;
  const matchedAgent = agentList.find(agent => agent.dataValues.agent_number === callee);

  return {
    ...outbound.dataValues,
    agent_name: matchedAgent?.dataValues.agent_name || null,
    agent_number: matchedAgent?.dataValues.agent_number || null,
  };
});


const normalizedInboundData = inboundData.map(item => item.dataValues);

// 5. Prepare final report
const finalReport = {
  incomingReports: normalizedInboundData,
  outboundReports: enrichedOutboundData
};


    SuccessRespnose.data = finalReport;
    SuccessRespnose.message = "Success";

    Logger.info(`Report with trace_id fetched successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log('error', error);
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(`Trace Report Fetch Failed -> ${JSON.stringify(error)}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}




module.exports = { createIncomingReport, getAll, getById, updateIncomingReport, deleteIncomingReport, getDidSpecificReport, getDidSpecificReportwithTraceId };
