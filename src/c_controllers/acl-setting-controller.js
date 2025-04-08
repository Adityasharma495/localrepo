const { StatusCodes } = require("http-status-codes");
const { AclSettingsRepository } = require("../c_repositories");
const {SuccessRespnose , ErrorResponse} = require("../utils/common");
const {MODULE_LABEL, ACTION_LABEL} = require('../utils/common/constants');
const { Logger } = require("../config");




const aclSettingRepo = new AclSettingsRepository();


async function getAll(req, res) {
  try {

    const data = await aclSettingRepo.getAll(req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(
      `Acl Settings -> recieved all successfully`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Acl Settings -> unable to get Acl Settings list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports={getAll}