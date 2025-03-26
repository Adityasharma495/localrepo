const { StatusCodes } = require("http-status-codes");
const { QueueRepository, UserJourneyRepository } = require("../repositories");
const {SuccessRespnose , ErrorResponse, Helpers} = require("../utils/common");
const AppError = require("../utils/errors/app-error");

const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');

const { Logger } = require("../config");

const queueRepo = new QueueRepository();
const userJourneyRepo = new UserJourneyRepository();


async function createQueue(req, res) {
  const bodyReq = req.body;
  try {
    const responseData = {};
    if (bodyReq.queue.name) {
      bodyReq.queue.name = Helpers.replaceSpaceWithUnderScore(bodyReq.queue.name);
    }

    const conditions = {
      name: bodyReq.queue.name,
      created_by: req.user.id
    }
    const checkDuplicate = await queueRepo.findOne(conditions);

    if (checkDuplicate && Object.keys(checkDuplicate).length != 0) {
      ErrorResponse.message = 'Queue Name Already Exist';
      return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    const queue = await queueRepo.create(bodyReq.queue);

    responseData.queue = queue;

    const userJourneyfields = {
      module_name: MODULE_LABEL.QUEUE,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Queue";

    Logger.info(
      `Queue -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Queue -> unable to create Queue: ${JSON.stringify(
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
  const { data } = req.query || null;

  try {
    const queueData = await queueRepo.getAll(req.user.id, data);
    SuccessRespnose.data = queueData;
    SuccessRespnose.message = "Success";

    Logger.info(
      `Queue -> recieved all successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Queue -> unable to get Queues list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getById(req, res) {
  const id = req.params.id;

  try {
    if (!id) {
      throw new AppError("Missing Queue Id", StatusCodes.BAD_REQUEST);
     }
    const queueData = await queueRepo.get(id);
    if (queueData.length == 0) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = queueData;

    Logger.info(
      `Queue -> recieved ${id} successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Queue not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Queue -> unable to get Queue ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateQueue(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;
  try {
    const responseData = {};
    if (bodyReq.queue.name) {
      bodyReq.queue.name = Helpers.replaceSpaceWithUnderScore(bodyReq.queue.name);
    }
    const currentData = await queueRepo.get(uid);

    // Check for duplicate queue name if it is being changed
    if (currentData.name !== bodyReq.queue.name) {
      const nameCondition = {
        created_by: req.user.id,
        name: bodyReq.queue.name
      };
      const nameDuplicate = await queueRepo.findOne(nameCondition);
      if (nameDuplicate) {
        ErrorResponse.message = 'Queue Name already exists';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }
   
    const queue = await queueRepo.update(uid, bodyReq.queue);
    if (!queue) {
      const error = new Error();
      error.name = 'CastError';
      throw error;
    }
    responseData.queue = queue;
    const userJourneyfields = {
      module_name: MODULE_LABEL.QUEUE,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    Logger.info(`Queue -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode, errorMsg
    if (error.name == 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = 'Queue not found';
    }
    else if (error.name == 'MongoServerError') {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == 'DuplicateKey') errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(`Queue-> unable to update Queue: ${uid}, data: ${JSON.stringify(bodyReq)}, error: ${JSON.stringify(error)}`);

    return res.status(statusCode).json(ErrorResponse);

  }
}

async function deleteQueue(req, res) {
  const id = req.body.queueIds;

  try {
    const response = await queueRepo.deleteMany(id);
    const userJourneyfields = {
      module_name: MODULE_LABEL.QUEUE,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id
    }

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Queue -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Queue not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Queue -> unable to delete Queue: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {createQueue, getAll, getById, updateQueue, deleteQueue}