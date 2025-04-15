const { StatusCodes } = require("http-status-codes");
const { QueueRepository, UserJourneyRepository } = require("../repositories");
const { SuccessRespnose, ErrorResponse, Helpers } = require("../utils/common");
const AppError = require("../utils/errors/app-error");

const { MODULE_LABEL, ACTION_LABEL } = require('../utils/common/constants');
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
    };

    const checkDuplicate = await queueRepo.findOne(conditions);
    if (checkDuplicate) {
      ErrorResponse.message = 'Queue Name Already Exists';
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const queue = await queueRepo.create(bodyReq.queue);
    responseData.queue = queue;

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.QUEUE,
      action: ACTION_LABEL.ADD,
      created_by: req.user.id
    });

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Queue";

    Logger.info(`Queue -> created successfully: ${JSON.stringify(responseData)}`);
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);

  } catch (error) {
    Logger.error(`Queue -> unable to create Queue: ${JSON.stringify(error)}`);

    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  const { data } = req.query || null;

  try {
    const queueData = await queueRepo.getAll(req.user.id, data);
    SuccessRespnose.data = queueData;
    SuccessRespnose.message = "Success";

    Logger.info(`Queue -> received all successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(`Queue -> unable to get Queues list, error: ${JSON.stringify(error)}`);
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
    if (!queueData) {
      const error = new Error("Queue not found");
      error.name = 'CastError';
      throw error;
    }

    SuccessRespnose.message = "Success";
    SuccessRespnose.data = queueData;

    Logger.info(`Queue -> received ${id} successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Queue not found";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(`Queue -> unable to get Queue ${id}, error: ${JSON.stringify(error)}`);
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
    if (!currentData) {
      throw new AppError("Queue not found", StatusCodes.BAD_REQUEST);
    }

    if (currentData.name !== bodyReq.queue.name) {
      const nameDuplicate = await queueRepo.findOne({
        created_by: req.user.id,
        name: bodyReq.queue.name
      });

      if (nameDuplicate) {
        ErrorResponse.message = 'Queue Name already exists';
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }

    const queue = await queueRepo.update(uid, bodyReq.queue);
    responseData.queue = queue;

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.QUEUE,
      action: ACTION_LABEL.EDIT,
      created_by: req.user.id
    });

    SuccessRespnose.message = 'Updated successfully!';
    SuccessRespnose.data = responseData;

    Logger.info(`Queue -> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === 'CastError') {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = 'Queue not found';
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(`Queue -> unable to update Queue: ${uid}, error: ${JSON.stringify(error)}`);
    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteQueue(req, res) {
  const id = req.body.queueIds;

  try {
    const response = await queueRepo.deleteMany(id);

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.QUEUE,
      action: ACTION_LABEL.DELETE,
      created_by: req.user.id
    });

    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Queue -> ${id} deleted successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Queue not found";
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    Logger.error(`Queue -> unable to delete Queue: ${id}, error: ${JSON.stringify(error)}`);
    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createQueue,
  getAll,
  getById,
  updateQueue,
  deleteQueue
};
