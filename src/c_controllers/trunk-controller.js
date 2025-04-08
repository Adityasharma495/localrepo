const { StatusCodes } = require("http-status-codes");
const { TrunkRepository, UserJourneyRepository } = require("../c_repositories");
const {SuccessRespnose , ErrorResponse , Authentication } = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const Operator = require("../c_db/operator")
const Codec = require("../c_db/codecs")
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");



const trunkRepo = new TrunkRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createTrunk(req, res) {
  const bodyReq = req.body;

  try {
    const responseData = {};
    const trunkPayload = { ...bodyReq.trunk };

    // ✅ Find operator ID from name
    const operatorName = trunkPayload.operator_id;
    const codecName = trunkPayload.codec_id


    const operatorRecord = await Operator.findOne({ where: { name: operatorName } });
    const codecRecord = await Codec.findOne({where:{name:codecName}})



    if (!operatorRecord) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Operator '${operatorName}' not found.`,
        error: "Invalid operator",
      });
    }
    if (!codecRecord) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Codec '${codecName}' not found.`,
        error: "Invalid Codec",
      });
    }

    // Replace 'operator' string with 'operator_id'
    trunkPayload.operator_id = operatorRecord.id;
    trunkPayload.codec_id = codecRecord.id;

    delete trunkPayload.operator;

    // Create trunk with corrected payload
    const trunk = await trunkRepo.create(trunkPayload);
    responseData.trunk = trunk;

    const userJourneyfields = {
      module_name: MODULE_LABEL.TRUNKS,
      action: ACTION_LABEL.ADD,
      createdBy: req?.user?.id
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new trunk";

    Logger.info(`Trunk -> created successfully: ${JSON.stringify(responseData)}`);

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(`Trunk -> unable to create trunk: ${JSON.stringify(bodyReq)} error: ${JSON.stringify(error)}`);

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "MongoServerError" || error.code === 11000) {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === "DuplicateKey") {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}



  async function getAll(req, res) {
    try {
      const data = await trunkRepo.getAll(req.user.id);
      SuccessRespnose.data = data;
      SuccessRespnose.message = "Success";
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
  
      Logger.error(
        `trunk -> unable to get trunk list, error: ${JSON.stringify(error)}`
      );
  
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }


  async function get(req, res) {
    const id = req.params.id;
  
    try {
      const trunkData = await trunkRepo.get(id);
      if (trunkData.length == 0) {
        const error = new Error();
        error.name = 'CastError';
        throw error;
      }
      SuccessRespnose.message = "Success";
      SuccessRespnose.data = trunkData;
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name == "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "Trunk not found";
      }
      ErrorResponse.message = errorMsg;
  
      Logger.error(
        `User -> unable to get ${id}, error: ${JSON.stringify(error)}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }


  async function deleteTrunk(req, res) {
    const id = req.body.trunkIds;
  
    try {
      const response = await trunkRepo.deleteMany(id);
  

      console.log("REPOSNE AFTER DELETE", response);


      // const userJourneyfields = {
      //   module_name: MODULE_LABEL.TRUNKS,
      //   action: ACTION_LABEL.DELETE,
      //   createdBy: req?.user?.id
      // }
  
      // await userJourneyRepo.create(userJourneyfields);
      SuccessRespnose.message = "Deleted successfully!";
      SuccessRespnose.data = response;
  
      Logger.info(`Trunk -> ${id} deleted successfully`);
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
  
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name == "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "Trunk not found";
      }
      ErrorResponse.message = errorMsg;
  
      Logger.error(
        `Trunk -> unable to delete user: ${id}, error: ${JSON.stringify(error)}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }



  async function updateTrunk(req, res) {
    const uid = req.params.id;
    const bodyReq = req.body;
  
    try {
      const responseData = {};
      const trunkPayload = { ...bodyReq.trunk };
  
  
      if (trunkPayload.operator_id && typeof trunkPayload.operator_id === "string") {
        const operatorRecord = await Operator.findOne({ where: { name: trunkPayload.operator_id } });
        if (!operatorRecord) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: `Operator '${trunkPayload.operator_id}' not found.`,
            error: "Invalid operator",
          });
        }
        trunkPayload.operator_id = operatorRecord.id;
      }
 
      if (trunkPayload.codec_id && typeof trunkPayload.codec_id === "string") {
        const codecRecord = await Codec.findOne({ where: { name: trunkPayload.codec_id } });
        if (!codecRecord) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: `Codec '${trunkPayload.codec_id}' not found.`,
            error: "Invalid codec",
          });
        }
        trunkPayload.codec_id = codecRecord.id;
      }
  

      const trunk = await trunkRepo.update(uid, trunkPayload);
      if (!trunk) {
        const error = new Error();
        error.name = "CastError";
        throw error;
      }
  
      responseData.trunk = trunk;
  
      const userJourneyfields = {
        module_name: MODULE_LABEL.TRUNKS,
        action: ACTION_LABEL.EDIT,
        createdBy: req?.user?.id,
      };
  
      const userJourney = await userJourneyRepo.create(userJourneyfields);
      responseData.userJourney = userJourney;
  
      SuccessRespnose.message = "Updated successfully!";
      SuccessRespnose.data = responseData;
  
      Logger.info(`Trunk -> ${uid} updated successfully`);
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message || "Something went wrong";
  
      if (error.name === "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "Trunk not found";
      } else if (error.name === "MongoServerError") {
        statusCode = StatusCodes.BAD_REQUEST;
        if (error.codeName === "DuplicateKey") {
          errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
        }
      }
  
      ErrorResponse.message = errorMsg;
  
      Logger.error(
        `Trunk-> unable to update trunk: ${uid}, data: ${JSON.stringify(
          bodyReq
        )}, error: ${JSON.stringify(error)}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }
  



  module.exports = {
    createTrunk,
    getAll,
    get,
    deleteTrunk,
    updateTrunk
  }