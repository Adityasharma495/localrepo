const { StatusCodes } = require("http-status-codes");
const { TrunksRepository, CallsRepository,UserJourneyRepository } = require("../repositories");
const { SuccessRespnose, ErrorResponse, Authentication } = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');

const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");

const trunkRepo = new TrunksRepository();
const callsRepo = new CallsRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createCalls(req, res) {
    const bodyReq = req.body;

    try {
        const responseData = {};
        const call = await callsRepo.create(bodyReq.calls);
        responseData.call = call;

        const userJourneyfields = {
            module_name: MODULE_LABEL.CALLS,
            action: ACTION_LABEL.ADD,
            createdBy: req?.user?.id
          }
      
        await userJourneyRepo.create(userJourneyfields);

        SuccessRespnose.data = responseData;
        SuccessRespnose.message = "Successfully created a new call";

        Logger.info(
            `Calls -> created successfully: ${JSON.stringify(responseData)}`
        );

        return res.status(StatusCodes.CREATED).json(SuccessRespnose);
    } catch (error) {
        Logger.error(
            `Calls -> unable to create call: ${JSON.stringify(
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
        const data = await callsRepo.getAll(req.user.id);
        SuccessRespnose.data = data;
        SuccessRespnose.message = "Success";

        return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
        ErrorResponse.message = error.message;
        ErrorResponse.error = error;

        Logger.error(
            `Calls -> unable to get calls list, error: ${JSON.stringify(error)}`
        );

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}


// async function get(req, res) {
//   const id = req.params.id;

//   try {
//     const trunkData = await trunkRepo.get(id);
//     if (trunkData.length == 0) {
//       const error = new Error();
//       error.name = 'CastError';
//       throw error;
//     }
//     SuccessRespnose.message = "Success";
//     SuccessRespnose.data = trunkData;

//     return res.status(StatusCodes.OK).json(SuccessRespnose);
//   } catch (error) {
//     let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
//     let errorMsg = error.message;

//     ErrorResponse.error = error;
//     if (error.name == "CastError") {
//       statusCode = StatusCodes.BAD_REQUEST;
//       errorMsg = "Trunk not found";
//     }
//     ErrorResponse.message = errorMsg;

//     Logger.error(
//       `User -> unable to get ${id}, error: ${JSON.stringify(error)}`
//     );

//     return res.status(statusCode).json(ErrorResponse);
//   }
// }

// async function deleteTrunk(req, res) {
//   const id = req.params.id;

//   try {
//     const response = await trunkRepo.delete(id);
//     SuccessRespnose.message = "Deleted successfully!";
//     SuccessRespnose.data = response;

// const userJourneyfields = {
    //     module_name: MODULE_LABEL.CALLS,
    //     action: ACTION_LABEL.DELETE,
    //     createdBy: req?.user?.id
    // }

    // await userJourneyRepo.create(userJourneyfields);

//     Logger.info(`Trunk -> ${id} deleted successfully`);

//     return res.status(StatusCodes.OK).json(SuccessRespnose);
//   } catch (error) {

//     let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
//     let errorMsg = error.message;

//     ErrorResponse.error = error;
//     if (error.name == "CastError") {
//       statusCode = StatusCodes.BAD_REQUEST;
//       errorMsg = "Trunk not found";
//     }
//     ErrorResponse.message = errorMsg;

//     Logger.error(
//       `Trunk -> unable to delete user: ${id}, error: ${JSON.stringify(error)}`
//     );

//     return res.status(statusCode).json(ErrorResponse);
//   }
// }


// async function updateTrunk(req, res) {
//   const uid = req.params.id;
//   const bodyReq = req.body;
//   try {

//     const responseData = {};
//     const trunk = await trunkRepo.update(uid, bodyReq.trunk);
//     if (!trunk) {
//       const error = new Error();
//       error.name = 'CastError';
//       throw error;
//     }
//     responseData.trunk = trunk;

//     SuccessRespnose.message = 'Updated successfully!';
//     SuccessRespnose.data = responseData;

        // const userJourneyfields = {
        //     module_name: MODULE_LABEL.CALLS,
        //     action: ACTION_LABEL.EDIT,
        //     createdBy: req?.user?.id
        // }

        // await userJourneyRepo.create(userJourneyfields);

//     Logger.info(`Trunk -> ${uid} updated successfully`);

//     return res.status(StatusCodes.OK).json(SuccessRespnose);

//   } catch (error) {

//     if (error.name == 'CastError') {
//       statusCode = StatusCodes.BAD_REQUEST;
//       errorMsg = 'Trunk not found';
//     }
//     else if (error.name == 'MongoServerError') {
//       statusCode = StatusCodes.BAD_REQUEST;
//       if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
//     }
//     ErrorResponse.message = errorMsg;

//     Logger.error(`Trunk-> unable to update trunk: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);

//     return res.status(statusCode).json(ErrorResponse);

//   }
// }

module.exports = {
    createCalls,
    getAll
};
