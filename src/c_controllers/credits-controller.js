const { StatusCodes } = require("http-status-codes");
const { CreditsRepository, UserRepository, UserJourneyRepository } = require("../c_repositories");
const { SuccessRespnose, ErrorResponse, ResponseFormatter } = require("../utils/common");
const {
  USER_CREDITS_ACTION,
  MODULE_LABEL,
  USERS_ROLE,
} = require("../utils/common/constants");
const { Logger } = require("../config");
const creditRepo = new CreditsRepository();
const userRepo = new UserRepository();
const version = process.env.API_V || '1';

const userJourneyRepo = new UserJourneyRepository();

async function updateCredit(req, res) {
  const bodyReq = req.body;

  try {
    let userRole = req.user.role;
    const responseData = {};
    let user;
    let fromUser;
    const updatedUser = await userRepo.get(bodyReq.id);
    const parentUser = await userRepo.get(updatedUser?.dataValues?.created_by);
    const fromUpdatedUser = await userRepo.get(bodyReq.fromUser);

    if (fromUpdatedUser?.dataValues?.id === (parentUser?.dataValues?.id)) {
      if (userRole == USERS_ROLE.SUPER_ADMIN) {
        if (bodyReq.action == USER_CREDITS_ACTION.ADD) {
          let updatedValue =
            Number(updatedUser?.dataValues?.credits_available) +
            Number(bodyReq.updatedCredit);

          user = await userRepo.update(bodyReq.id, {
            credits_available: updatedValue,
          });

          await creditRepo.create({
            user_id: bodyReq.id,
            from_user: bodyReq.fromUser,
            to_user: bodyReq.id,
            credits: Number(updatedUser?.dataValues?.credits_available),
            credits_rupees: Number(bodyReq.updatedCredit),
            action: USER_CREDITS_ACTION.ADD,
            balance: updatedValue,
            action_user: bodyReq.id,
          });

          await creditRepo.create({
            user_id: bodyReq.id,
            from_user: bodyReq.fromUser,
            to_user: bodyReq.id,
            credits: Number(fromUpdatedUser?.dataValues?.credits_available),
            credits_rupees: Number(bodyReq.updatedCredit),
            action: USER_CREDITS_ACTION.DEDUCT,
            balance: updatedValue,
            action_user: bodyReq.fromUser,
          });

          await userJourneyRepo.create({
            module_name: MODULE_LABEL.CREDITS,
            action: USER_CREDITS_ACTION.ADD,
            created_by: req?.user?.id,
          });
        } else if (bodyReq.action == USER_CREDITS_ACTION.DEDUCT) {
          let updatedValue =
            Number(updatedUser?.dataValues?.credits_available) -
            Number(bodyReq.updatedCredit);

          if (updatedValue < 0) {
            let errorMessage = "Updated Credits Cannot be less than 0";
            return res
              .status(StatusCodes.BAD_REQUEST)
              .json({ message: errorMessage });
          }
          user = await userRepo.update(bodyReq.id, {
            credits_available: updatedValue,
          });

          await creditRepo.create({
            user_id: bodyReq.fromUser,
            from_user: bodyReq.fromUser,
            to_user: bodyReq.id,
            credits: Number(updatedUser?.dataValues?.credits_available),
            credits_rupees: Number(bodyReq.updatedCredit),
            action: USER_CREDITS_ACTION.DEDUCT,
            balance: updatedValue,
            action_user: bodyReq.id,
          });

          await creditRepo.create({
            user_id: bodyReq.id,
            from_user: bodyReq.fromUser,
            to_user: bodyReq.id,
            credits: Number(fromUpdatedUser?.dataValues?.credits_available),
            credits_rupees: Number(bodyReq.updatedCredit),
            action: USER_CREDITS_ACTION.ADD,
            balance: updatedValue,
            action_user: bodyReq.fromUser,
          });

          await userJourneyRepo.create({
            module_name: MODULE_LABEL.CREDITS,
            action: USER_CREDITS_ACTION.DEDUCT,
            created_by: req?.user?.id,
          });
        }
      } else {
        if (bodyReq.action == USER_CREDITS_ACTION.ADD) {
          let updatedValue =
            Number(updatedUser?.dataValues?.credits_available) +
            Number(bodyReq.updatedCredit);

          let updatedValueForFromUser =
            Number(fromUpdatedUser?.dataValues?.credits_available) -
            Number(bodyReq.updatedCredit);
          user = await userRepo.update(bodyReq.id, {
            credits_available: updatedValue,
          });
          if (updatedValueForFromUser < 0) {
            let errorMessage =
              "Your account has not enough credits to contribute.";
            return res
              .status(StatusCodes.BAD_REQUEST)
              .json({ message: errorMessage });
          } else {
            fromUser = await userRepo.update(bodyReq.fromUser, {
              credits_available: updatedValueForFromUser,
            });
          }

          await creditRepo.create({
            user_id: bodyReq.id,
            from_user: bodyReq.fromUser,
            to_user: bodyReq.id,
            credits: Number(updatedUser?.dataValues?.credits_available),
            credits_rupees: Number(bodyReq.updatedCredit),
            action: USER_CREDITS_ACTION.ADD,
            balance: updatedValue,
            action_user: bodyReq.id,
          });

          await creditRepo.create({
            user_id: bodyReq.id,
            from_user: bodyReq.fromUser,
            to_user: bodyReq.id,
            credits: Number(fromUpdatedUser?.dataValues?.credits_available),
            credits_rupees: Number(bodyReq.updatedCredit),
            action: USER_CREDITS_ACTION.DEDUCT,
            balance: updatedValueForFromUser,
            action_user: bodyReq.fromUser,
          });

          await userJourneyRepo.create({
            module_name: MODULE_LABEL.CREDITS,
            action: USER_CREDITS_ACTION.ADD,
            created_by: req?.user?.id,
          });
        } else if (bodyReq.action == USER_CREDITS_ACTION.DEDUCT) {
          let updatedValue =
            Number(updatedUser?.dataValues?.credits_available) -
            Number(bodyReq.updatedCredit);
          let updatedValueForFromUser =
            Number(fromUpdatedUser?.dataValues?.credits_available) +
            Number(bodyReq.updatedCredit);
          if (updatedValue < 0) {
            let errorMessage = "Updated Credits Cannot be less than 0";
            return res
              .status(StatusCodes.BAD_REQUEST)
              .json({ message: errorMessage });
          }
          user = await userRepo.update(bodyReq.id, {
            credits_available: updatedValue,
          });

          fromUser = await userRepo.update(bodyReq.fromUser, {
            credits_available: updatedValueForFromUser,
          });

          await creditRepo.create({
            user_id: bodyReq.fromUser,
            from_user: bodyReq.fromUser,
            to_user: bodyReq.id,
            credits: Number(updatedUser?.dataValues?.credits_available),
            credits_rupees: Number(bodyReq.updatedCredit),
            action: USER_CREDITS_ACTION.DEDUCT,
            balance: updatedValue,
            action_user: bodyReq.fromUser,
          });

          await creditRepo.create({
            user_id: bodyReq.id,
            from_user: bodyReq.fromUser,
            to_user: bodyReq.id,
            credits: Number(fromUpdatedUser?.dataValues?.credits_available),
            credits_rupees: Number(bodyReq.updatedCredit),
            action: USER_CREDITS_ACTION.ADD,
            balance: updatedValueForFromUser,
            action_user: bodyReq.id,
          });

          await userJourneyRepo.create({
            module_name: MODULE_LABEL.CREDITS,
            action: USER_CREDITS_ACTION.DEDUCT,
            created_by: req?.user?.id,
          });
        }
      }

      SuccessRespnose.data = ResponseFormatter.formatResponseIds(responseData, version);
      SuccessRespnose.message = "Successfully Updated User's Credit";

      Logger.info(
        `Credit -> Updated successfully: ${JSON.stringify(responseData)}`
      );
      return res.status(StatusCodes.ACCEPTED).json(SuccessRespnose);
    } else {
      let errorMessage = "";
      if (parentUser?.dataValues?.role == USERS_ROLE.SUPER_ADMIN) {
        errorMessage = "Superadmin cannot directly recharge other Users";
      } else if (parentUser?.dataValues?.role == USERS_ROLE.RESELLER) {
        errorMessage = "Reseller cannot directly recharge other Users";
      } else if (parentUser?.dataValues?.role == USERS_ROLE.COMPANY_ADMIN) {
        errorMessage = "Company User cannot directly recharge other Users";
      } else {
        errorMessage = "You cannot directly recharge other Users";
      }
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: errorMessage });
    }
  } catch (error) {
    Logger.error(
      `Credit -> unable to create Credit: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;
    if (error.name == "MongoServerError" || error.code == 11000) {
      statusCode = StatusCodes.BAD_REQUEST;
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    let data;

    if (req.user.role !== USERS_ROLE.SUPER_ADMIN) {
      data = await creditRepo.getAll(req.user.id);
    } else {
      data = await creditRepo.getAll();
    }
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(data, version);
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {    
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Credit -> unable to get Credit list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function get(req, res) {
  const id = req.params.id;

  try {
    const whereCondition = {
      where: {
        id: id
      }
    };
    const aclData = await creditRepo.findOne(whereCondition);
    console.log("aclData", aclData);
    if (aclData.length == 0) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = ResponseFormatter.formatResponseIds(aclData, version);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) { 
    console.log("error", error);
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Credit not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Credit -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  getAll,
  updateCredit,
  get,
};