const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const {
  LocationsRepository,
  UserJourneyRepository,
  UserLocationsRepository,
} = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const {
  MODULE_LABEL,
  ACTION_LABEL,
} = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const smswebhookRepo = new LocationsRepository();
const userJourneyRepo = new UserJourneyRepository();
const userLocationsRepository = new UserLocationsRepository();

async function createLocation(req, res) {
  const bodyReq = req.body;
  try {
    bodyReq.created_by = req.user.id;
    const responseData = {};

    const existingWebhook = await smswebhookRepo.findOne({
      location_name: bodyReq.location_name.trim(),
      created_by: bodyReq.created_by,
      is_deleted: false,
    });

    if (existingWebhook) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "Location With same name already exists, please choose another name.",
      });
    }

    //   Create webhook with corrected payload
    const webhookData = await smswebhookRepo.create(bodyReq);
    responseData.location = webhookData;

    //  Add user journey
    const userJourneyfields = {
      module_name: MODULE_LABEL.LOCATION,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new Location";

    Logger.info(
      `Location -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `Location -> unable to create location: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "Something went wrong while creating location";

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    const data = await smswebhookRepo.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Location -> unable to get locations list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function get(req, res) {
  const id = req.params.id;

  try {
    const webhookData = await smswebhookRepo.get(id);
    if (webhookData.length == 0) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = webhookData;

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Location not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Location -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteLocation(req, res) {
  const id = req.body.id;

  try {
    const response = await smswebhookRepo.delete(id);

    const userJourneyfields = {
      module_name: MODULE_LABEL.LOCATION,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`Location -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Location not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Location -> unable to delete location: ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateLocation(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};

    //  Ensure webhook exists first
    const existingWebhook = await smswebhookRepo.findOne({ location_id: uid, is_deleted: false });
    if (!existingWebhook) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Location not found" });
    }

    //  Check if another webhook already exists with same name & created_by
    if (bodyReq.location_name) {
      const duplicateWebhook = await smswebhookRepo.findOne({
        location_name: bodyReq.location_name.trim(),
        created_by: req.user.id,
        location_id: { [Op.ne]: uid }, // exclude the current webhook
        is_deleted: false,
      });

      if (duplicateWebhook) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message:
            "Location with same name already exists, please choose another name.",
        });
      }
    }

    //  Proceed with update
    const webhookData = await smswebhookRepo.update(uid, bodyReq);
    if (!webhookData) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }

    responseData.location = webhookData;

    //  Add user journey
    const userJourneyfields = {
      module_name: MODULE_LABEL.LOCATION,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`Location -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "Something went wrong";

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Location not found";
    } else if (error.name === "MongoServerError") {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === "DuplicateKey") {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;

    Logger.error(
      `Loation-> unable to update location: ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function bulkAddToUsersLocation(req, res) {
  const { location_id, user_ids } = req.body;

  try {
    if (!location_id) {
      return res.status(400).json({ message: "location_id is required" });
    }

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: "user_ids must be a non-empty array" });
    }

    const location = await smswebhookRepo.findOne({ location_id: location_id, is_deleted: false});
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const existingUserLocations = await userLocationsRepository.findByLocationId(location_id);
    const existingUserIds = [
      ...new Set(existingUserLocations.map((ul) => ul.user_id.toString()))
    ];
    const newUserIds = user_ids.filter((id) => !existingUserIds.includes(id.toString()));

    if (newUserIds.length === 0) {
      return res.status(200).json({ message: "All users already assigned to location" });
    }

    const bulkData = newUserIds.map((user_id) => ({
      user_id,
      location_id,
    }));

    const insertedRows = await userLocationsRepository.insertMany(bulkData);

    const userJourneyFields = {
      module_name: MODULE_LABEL.LOCATION,
      action: "Bulk Add To Users",
      created_by: req?.user?.id,
    };
    await userJourneyRepo.create(userJourneyFields);

    SuccessRespnose.message = "Users added to location successfully";
    SuccessRespnose.data = insertedRows;

    Logger.info(`Bulk added users to location -> ${location_id}: ${newUserIds}`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `BulkAddToUsersLocation failed for location: ${location_id}, data: ${JSON.stringify(
        req.body
      )}, error: ${error}`
    );

    return res.status(500).json({ message: error.message || "Something went wrong" });
  }
}

async function bulkDeleteFromUsersLocation(req, res) {
  const { location_id, user_ids } = req.body;

  try {
    if (!location_id) {
      return res.status(400).json({ message: "location_id is required" });
    }

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: "user_ids must be a non-empty array" });
    }

    const location = await smswebhookRepo.findOne({ location_id: location_id, is_deleted: false});
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const existingUserLocations = await userLocationsRepository.findByLocationId(location_id);
    const existingUserIds = [
      ...new Set(existingUserLocations.map((ul) => ul.user_id.toString()))
    ];
    const deleteUserIds = user_ids.filter((id) => existingUserIds.includes(id.toString()));

    if (deleteUserIds.length === 0) {
      return res.status(200).json({ message: "No users found in this location to delete" });
    }

    const deletedRows = await userLocationsRepository.hardDeleteManyByLocationAndUserId(
      deleteUserIds,
      location_id
    );

    const userJourneyFields = {
      module_name: MODULE_LABEL.LOCATION,
      action: "Bulk Delete From Users",
      created_by: req?.user?.id,
      details: JSON.stringify({ location_id, user_ids: deleteUserIds }),
    };
    await userJourneyRepo.create(userJourneyFields);

    SuccessRespnose.message = "Users removed from location successfully";
    SuccessRespnose.data = {
      location_id,
      deleted_users: deleteUserIds,
      deletedCount: deletedRows,
    };

    Logger.info(`Bulk deleted users from location -> ${location_id}: ${deleteUserIds}`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `BulkDeleteFromUsersLocation failed for location: ${location_id}, data: ${JSON.stringify(
        req.body
      )}, error: ${error}`
    );

    return res.status(500).json({ message: error.message || "Something went wrong" });
  }
}

module.exports = {
  createLocation,
  getAll,
  get,
  deleteLocation,
  updateLocation,
  bulkAddToUsersLocation,
  bulkDeleteFromUsersLocation,
};
