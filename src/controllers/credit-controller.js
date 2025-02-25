const { StatusCodes } = require("http-status-codes");
const { CreditRepository, UserRepository } = require("../repositories");
const { SuccessRespnose, ErrorResponse } = require("../utils/common");
const {
  USER_CREDITS_ACTION,
  USERS_ROLE,
} = require("../utils/common/constants");
const { Logger } = require("../config");
const creditRepo = new CreditRepository();
const userRepo = new UserRepository();

async function updateCredit(req, res) {
  const bodyReq = req.body;

  try {
    let userRole = req.user.role;
    const responseData = {};
    let user;
    let fromUser;

    const updatedUser = await userRepo.get(bodyReq.id);
    const parentUser = await userRepo.get(updatedUser.createdBy);
    const fromUpdatedUser = await userRepo.get(bodyReq.fromUser);

    if (fromUpdatedUser._id.equals(parentUser._id)) {
      if (userRole == USERS_ROLE.SUPER_ADMIN) {
        if (bodyReq.action == USER_CREDITS_ACTION.ADD) {
          let updatedValue =
            Number(updatedUser.credits_available) +
            Number(bodyReq.updatedCredit);

          user = await userRepo.update(bodyReq.id, {
            credits_available: updatedValue,
          });

          let balanceCredits = user.credits_available.toFixed(2);
          await creditRepo.create({
            user_id: bodyReq.id,
            fromUser: bodyReq.fromUser,
            toUser: bodyReq.id,
            credits: Number(updatedUser.credits_available).toFixed(2),
            credits_rupees: Number(bodyReq.updatedCredit).toFixed(2),
            action: USER_CREDITS_ACTION.ADD,
            balance: balanceCredits,
            actionUser: bodyReq.id,
          });

          await creditRepo.create({
            user_id: bodyReq.id,
            fromUser: bodyReq.fromUser,
            toUser: bodyReq.id,
            credits: Number(fromUpdatedUser.credits_available).toFixed(2),
            credits_rupees: Number(bodyReq.updatedCredit).toFixed(2),
            action: USER_CREDITS_ACTION.DEDUCT,
            balance: balanceCredits,
            actionUser: bodyReq.fromUser,
          });
        } else if (bodyReq.action == USER_CREDITS_ACTION.DEDUCT) {
          let updatedValue =
            Number(updatedUser.credits_available) -
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

          let balanceCredits = user.credits_available.toFixed(2);

          await creditRepo.create({
            user_id: bodyReq.fromUser,
            fromUser: bodyReq.fromUser,
            toUser: bodyReq.id,
            credits: Number(updatedUser.credits_available).toFixed(2),
            credits_rupees: Number(bodyReq.updatedCredit).toFixed(2),
            action: USER_CREDITS_ACTION.DEDUCT,
            balance: balanceCredits,
            actionUser: bodyReq.id,
          });

          await creditRepo.create({
            user_id: bodyReq.id,
            fromUser: bodyReq.fromUser,
            toUser: bodyReq.id,
            credits: Number(fromUpdatedUser.credits_available).toFixed(2),
            credits_rupees: Number(bodyReq.updatedCredit).toFixed(2),
            action: USER_CREDITS_ACTION.ADD,
            balance: balanceCredits,
            actionUser: bodyReq.fromUser,
          });
        }
      } else {
        if (bodyReq.action == USER_CREDITS_ACTION.ADD) {
          let updatedValue =
            Number(updatedUser.credits_available) +
            Number(bodyReq.updatedCredit);

          let updatedValueForFromUser =
            Number(fromUpdatedUser.credits_available) -
            Number(bodyReq.updatedCredit);

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

            user = await userRepo.update(bodyReq.id, {
              credits_available: updatedValue,
            });

            let balanceCredits = user.credits_available.toFixed(2);
            let balanceCreditOfFromUser = fromUser.credits_available.toFixed(2);
            await creditRepo.create({
              user_id: bodyReq.id,
              fromUser: bodyReq.fromUser,
              toUser: bodyReq.id,
              credits: Number(updatedUser.credits_available).toFixed(2),
              credits_rupees: Number(bodyReq.updatedCredit).toFixed(2),
              action: USER_CREDITS_ACTION.ADD,
              balance: balanceCredits,
              actionUser: bodyReq.id,
            });

            await creditRepo.create({
              user_id: bodyReq.id,
              fromUser: bodyReq.fromUser,
              toUser: bodyReq.id,
              credits: Number(fromUpdatedUser.credits_available).toFixed(2),
              credits_rupees: Number(bodyReq.updatedCredit).toFixed(2),
              action: USER_CREDITS_ACTION.DEDUCT,
              balance: balanceCreditOfFromUser,
              actionUser: bodyReq.fromUser,
            });
          }
        } else if (bodyReq.action == USER_CREDITS_ACTION.DEDUCT) {
          let updatedValue =
            Number(updatedUser.credits_available) -
            Number(bodyReq.updatedCredit);
          let updatedValueForFromUser =
            Number(fromUpdatedUser.credits_available) +
            Number(bodyReq.updatedCredit);
          if (updatedValue < 0) {
            let errorMessage = "Updated Credits Cannot be less than 0";
            return res
              .status(StatusCodes.BAD_REQUEST)
              .json({ message: errorMessage });
          } else {
            user = await userRepo.update(bodyReq.id, {
              credits_available: updatedValue,
            });

            fromUser = await userRepo.update(bodyReq.fromUser, {
              credits_available: updatedValueForFromUser,
            });

            let balanceCredits = user.credits_available.toFixed(2);
            let balanceCreditOfFromUser = fromUser.credits_available.toFixed(2);
            await creditRepo.create({
              user_id: bodyReq.fromUser,
              fromUser: bodyReq.fromUser,
              toUser: bodyReq.id,
              credits: Number(updatedUser.credits_available).toFixed(2),
              credits_rupees: Number(bodyReq.updatedCredit).toFixed(2),
              action: USER_CREDITS_ACTION.DEDUCT,
              balance: balanceCredits,
              actionUser: bodyReq.fromUser,
            });

            await creditRepo.create({
              user_id: bodyReq.id,
              fromUser: bodyReq.fromUser,
              toUser: bodyReq.id,
              credits: Number(fromUpdatedUser.credits_available).toFixed(2),
              credits_rupees: Number(bodyReq.updatedCredit).toFixed(2),
              action: USER_CREDITS_ACTION.ADD,
              balance: balanceCreditOfFromUser,
              actionUser: bodyReq.id,
            });
          }
        }
      }

      SuccessRespnose.data = responseData;
      SuccessRespnose.message = "Successfully Updated User's Credit";

      Logger.info(
        `Credit -> Updated successfully: ${JSON.stringify(responseData)}`
      );

      return res.status(StatusCodes.ACCEPTED).json(SuccessRespnose);
    } else {
      let errorMessage = "";
      if (parentUser.role == USERS_ROLE.SUPER_ADMIN) {
        errorMessage = "Superadmin cannot directly recharge other Users";
      } else if (parentUser.role == USERS_ROLE.RESELLER) {
        errorMessage = "Reseller cannot directly recharge other Users";
      } else if (parentUser.role == USERS_ROLE.COMPANY_ADMIN) {
        errorMessage = "Company User cannot directly recharge other Users";
      } else {
        errorMessage = "You cannot directly recharge other Users";
      }
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: errorMessage });
    }
  } catch (error) {
    console.log("Error updating user credits", error);
    Logger.error(
      `Credit -> unable to create Credit: ${JSON.stringify(
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
    let data;
    if (req.user.role !== USERS_ROLE.SUPER_ADMIN) {
      data = await creditRepo.getAll(req.user.id);
    } else {
      data = await creditRepo.getAll();
    }
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    console.log("error getting credits", error);

    Logger.error(
      `Credit -> unable to get Credit list, error: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function get(req, res) {
  const id = req.params.id;

  try {
    const aclData = await creditRepo.get(id);
    if (aclData.length == 0) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = aclData;

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
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
