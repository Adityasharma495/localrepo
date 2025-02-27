const {UserRepository} = require("../c_repositories")
const { StatusCodes } = require("http-status-codes");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../utils/common");

const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");
const {MODULE_LABEL, ACTION_LABEL, USERS_ROLE, PREFIX_VALUE, SUB_LICENCE_ROLE, USER_ROLE_VALUE} = require('../utils/common/constants');

const userRepo = new UserRepository();


async function signinUser(req, res) {
    console.log("INTERNAL SIGNIN USER MAIN !", req.body);
    const bodyReq = req.body;
    const username = bodyReq.username;

    console.log("USERNAME HERE", username);
  
    try {
      //Fetch user via username
      const user = await userRepo.getByUsername(username);

      console.log("USERE HERE", user);
      if (user) {
        if (user.isValidLogin() == false)
          throw new AppError("Inactive or deleted user", StatusCodes.FORBIDDEN);
        const isPasswordMatch = await user.comparePassword(bodyReq.password);
        if (isPasswordMatch) {
          //If the passwords match, then create token and return it
          const userData = await user.generateUserData(true);
  
          SuccessRespnose.message = "Successfully signed in";
          SuccessRespnose.data = userData;
  
          const userJourneyfields = {
            module_name: MODULE_LABEL.USERS,
            action: ACTION_LABEL.LOGIN,
            createdBy:  userData._id
          }
      
          await userJourneyRepo.create(userJourneyfields);
  
          Logger.info(`User -> ${userData._id} login successfully`);
  
          return res.status(StatusCodes.OK).json(SuccessRespnose);
        }
  
        throw new AppError("Invalid Password", StatusCodes.BAD_REQUEST);
      }
  
      throw new AppError("User not found", StatusCodes.BAD_REQUEST);
    } catch (error) {
      ErrorResponse.error = error;
      ErrorResponse.message = error.message;
  
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      if (error instanceof AppError) {
        statusCode = StatusCodes.BAD_REQUEST;
      }
  
      Logger.error(
        `User -> unable to login user ${username}, error: ${JSON.stringify(
          error
        )}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }

  async function getAll(req, res) {

    console.log("CAME TO GET ALL USERS");
    try {
      const userRole = req.query.role;
      const response = await userRepo.getAllByRoles(
        req.user.id,
        req.user.role,
        userRole
      );
  
      SuccessRespnose.message = "Success";
      SuccessRespnose.data = response;
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      ErrorResponse.message = error.message;
      ErrorResponse.error = error;
  
      Logger.error(
        `User -> unable to get users list, error: ${JSON.stringify(error)}`
      );
  
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  }


  module.exports = {
    signinUser,
    getAll
  }