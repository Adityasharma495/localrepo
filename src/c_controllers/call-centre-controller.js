const { StatusCodes } = require("http-status-codes");
const {
  CallCentreRepository,
  UserRepository,
  UserJourneyRepository,
  SubUserLicenceRepository
} = require("../../shared/c_repositories");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { Op } = require("sequelize");
const { Logger } = require("../../shared/config");
const { MODULE_LABEL, ACTION_LABEL } = require("../../shared/utils/common/constants");
const callCentreRepository = new CallCentreRepository();
const userRepository = new UserRepository();
const userJourneyRepo = new UserJourneyRepository();
const subUserLicenceRepo = new SubUserLicenceRepository();

async function create(req, res) {
  const bodyReq = req.body;
  const userId = req.user.id;
  let data = null;

  try {
    const existingCallCenter = await callCentreRepository.findOne({
      [Op.and]: [
        { created_by: userId },
        {
          [Op.or]: [
            { name: bodyReq?.name?.trim() },
            { domain: bodyReq?.domain?.trim() }
          ]
        }
      ]
    });

    if (existingCallCenter) {
      ErrorResponse.message = 'Call Center With Same Name or Domain Already exists.';
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }

    data = {
      name: bodyReq.name.trim(),
      domain: bodyReq.domain.trim(),
      description: bodyReq.description.trim(),
      created_by: req.user.id,
      company: req.user.companies?.id,
      country_code_id: Number(bodyReq.countryCode.trim()),
      timezone_id: Number(bodyReq.timezone.trim()),
    };

    const response = await callCentreRepository.create(data);
    //entry in sub-user-licence
    const subUserLicenceData = await subUserLicenceRepo.create({
      callcenter_id: response.id,
      total_licence: bodyReq.licence,
      available_licence: bodyReq.licence,
      created_by: req.user.id
    })
    
    const subUserLicenceId = subUserLicenceData.id
    await callCentreRepository.update(response.id, { sub_user_licence_id: subUserLicenceId })

    SuccessRespnose.data = response
    SuccessRespnose.message = "Successfully created call centre";

    const userJourneyfields = {
      module_name: MODULE_LABEL.CALL_CENTER,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);

    Logger.info(`Call Centre -> created successfully: ${JSON.stringify(data)}`);

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    console.log(error)
    Logger.error(
      `Call Centre -> unable to create: ${JSON.stringify(
        data
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
    const data = await callCentreRepository.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Call Centre -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Call Centre -> unable to get call centres list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function get(req, res) {
  const callCentreId = req.params.id;

  try {
    const data = await callCentreRepository.get(callCentreId);
    SuccessRespnose.data = data;

    Logger.info(`Call Centre -> recieved ${callCentreId} successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log("error", error);
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Call Centre not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Call Centre -> unable to get ${callCentreId}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateCallCentre(req, res) {
  const callCentreId = req.params.id;
  const bodyReq = req.body;
  console.log('bodyReq', bodyReq)
  const data = {
    name: bodyReq.name.trim(),
    domain: bodyReq.domain.trim(),
    description: bodyReq.description.trim(),
    country_code_id: bodyReq.countryCode.trim(),
    timezone_id: bodyReq.timezone.trim(),
  };

  try {
    const existingCallCenter = await callCentreRepository.findOne({
      created_by: req.user.id,
      id: { [Op.ne]: callCentreId },
      [Op.or]: [
        { name: bodyReq.name.trim() },
        { domain: bodyReq.domain.trim() }
      ]
    });

    if (existingCallCenter) {
      ErrorResponse.message = 'Call Center With Same Name or Domain Already exists.';
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }

    const callcenterData =  await callCentreRepository.get(callCentreId)
    console.log('callcenterData', callcenterData)

    const totalLicence = callcenterData?.subUserLicenceId?.total_licence?.callcenter
    const availableLicence = callcenterData?.subUserLicenceId?.available_licence?.callcenter
    const usedLicence = Number(totalLicence) - Number(availableLicence)
    if (usedLicence > Number(bodyReq?.licence?.callcenter)) {
            ErrorResponse.message = `Can't update Used licence are greater`;
                return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);     
    }

    await subUserLicenceRepo.updateById(callcenterData?.sub_user_licence_id, {
      total_licence: bodyReq.licence,
      available_licence: bodyReq.licence,
    })

    const response = await callCentreRepository.update(callCentreId, data);

    SuccessRespnose.data = response
    SuccessRespnose.message = "Updated successfully";

    const userJourneyfields = {
      module_name: MODULE_LABEL.CALL_CENTER,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);

    Logger.info(`Call Centre -> ${callCentreId} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log(error)
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Call Centre not found";
    } else if (error.name == "MongoServerError") {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == "DuplicateKey")
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Call Centre -> unable to update user: ${callCentreId}, data: ${data}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getUsers(req, res) {
  const callCentreId = req.params.id;

  try {
    const data = await userRepository.getCallCentreUsers(callCentreId);
    SuccessRespnose.data = data;

    Logger.info(
      `Call Centre -> recieved users based on ${callCentreId} successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Call Centre not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Call Centre -> unable to get users: ${callCentreId}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  create,
  getAll,
  get,
  updateCallCentre,
  getUsers,
};
