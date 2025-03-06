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

    const bodyReq = req.body;
    const username = bodyReq.username;
  
    try {
      //Fetch user via username
      const user = await userRepo.getByUsername(username);
      if (user) {
        // if (user.isValidLogin() == false)
        //   throw new AppError("Inactive or deleted user", StatusCodes.FORBIDDEN);
        const isPasswordMatch = await user.comparePassword(bodyReq.password);


        if (isPasswordMatch) {
          
          const userData = await user.generateUserData(true);
  
          SuccessRespnose.message = "Successfully signed in";
          SuccessRespnose.data = userData;
  
          // const userJourneyfields = {
          //   module_name: MODULE_LABEL.USERS,
          //   action: ACTION_LABEL.LOGIN,
          //   createdBy:  userData._id
          // }
      
          // await userJourneyRepo.create(userJourneyfields);
  
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


  async function logoutUser(req, res) {
  
    // try {
    //   const userJourneyfields = {
    //     module_name: MODULE_LABEL.USERS,
    //     action: ACTION_LABEL.LOGOUT,
    //     createdBy:  req.user.id
    //   }
  
    //   await userJourneyRepo.create(userJourneyfields);
    //   Logger.info(`User -> ${req.user.id} Logout successfully`);
  
    //   return res.status(StatusCodes.OK).json(SuccessRespnose);
    // } catch (error) {
    //   let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    //   let errorMsg = error.message;
  
    //   ErrorResponse.error = error;
    //   if (error.name == "CastError") {
    //     statusCode = StatusCodes.BAD_REQUEST;
    //     errorMsg = "User not found";
    //   }
    //   ErrorResponse.message = errorMsg;
  
    //   Logger.error(
    //     `User -> unable to logout user: ${req.user.id}, error: ${JSON.stringify(error)}`
    //   );
  
    //   return res.status(statusCode).json(ErrorResponse);
    // }
  }


  async function get(req, res) {
    const uid = req.params.id;
  
    try {
      const user = await userRepo.get(uid);
      let userData = await user.generateUserData();
      userData.companies = user.companies 
  
      const availLicence = await licenceRepo.findOne({user_id : uid})
      userData.licence = availLicence?.total_licence
  
      if (req.user.role === USERS_ROLE.RESELLER) {
        const subUserLicence = await subUserLicenceRepo.findOne({user_id : uid})
        userData.sub_licence = subUserLicence
      }
  
      SuccessRespnose.message = "Success";
      SuccessRespnose.data = userData;
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name == "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "User not found";
      }
      ErrorResponse.message = errorMsg;
  
      Logger.error(
        `User -> unable to get ${uid}, error: ${JSON.stringify(error)}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }

  async function deleteUser(req, res) {
    const userIds = req.body.userIds;
    let response
  
    try {
      
      if (req.user.role === USERS_ROLE.SUPER_ADMIN || req.user.role === USERS_ROLE.SUB_SUPERADMIN) {
        //Delete for current users
        for (const userId of userIds) {
          const data = await licenceRepo.findOne({ user_id: userId });
          if (data) {
              await licenceRepo.updateByUserId(userId, {is_deleted: true});
          }
        }
  
        // Check if reseller has any child if yes don't delete reseller
        for (const userId of userIds) {
          const data = await userRepo.findOne({ createdBy: userId });
          if (data) {
            ErrorResponse.message = `Child Present, Reseller Can't Deleted`;
            return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json(ErrorResponse);
          } else {
            response = await userRepo.deleteMany(userIds, req.user);
          }
        } 
      } else {
        await userRepo.deleteMany(userIds, req.user);
        for (const userId of userIds) {
          const loggedInData = await userRepo.getForLicence(userId);
          const availableLicence = loggedInData.sub_user_licence_id.available_licence;
          const data = await userRepo.findOne({ _id: userId });
          let updatedData = { ...availableLicence };
          updatedData[data.role] = (updatedData[data.role] || 0) + 1;
          await subUserLicenceRepo.update(loggedInData.sub_user_licence_id._id, {available_licence: updatedData})
        }
      }
  
      const userJourneyfields = {
        module_name: MODULE_LABEL.USERS,
        action: ACTION_LABEL.DELETE,
        createdBy:  req?.user?.id
      }
  
      await userJourneyRepo.create(userJourneyfields);
      
      SuccessRespnose.message = "Deleted successfully!";
      SuccessRespnose.data = response;
  
      Logger.info(`User -> ${userIds} deleted successfully`);
  
      return res.status(StatusCodes.OK).json(SuccessRespnose);
    } catch (error) {
      console.log(error)
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name == "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "User not found";
      } else if (error.message.includes("logged-in superadmin")) {
        statusCode = StatusCodes.FORBIDDEN;
        errorMsg = 'One or more users were not created by the logged-in superadmin, so deletion is not allowed.'
      } else if (error.message.includes("child records")) {
        statusCode = StatusCodes.CONFLICT;
        errorMsg = 'One or more records cannot be deleted as they have child records.'
      }
      ErrorResponse.message = errorMsg;
  
      Logger.error(
        `User -> unable to delete user: ${userIds}, error: ${JSON.stringify(error)}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }


  async function statusPasswordUpdateUser(req, res) {
    const uid = req.params.id;
    const bodyReq = req.body;
  
    try {
      const responseData = {};
      const user = await userRepo.get(uid);
      // update status
      if (bodyReq.hasOwnProperty("status")) {
        if(user.status == 1){
          user.status = 0;
        }
        else{
          user.status = 1;
        }
        await userRepo.update(uid, { status: user.status });
    
        SuccessRespnose.message = "User Status Updated Successfully!";
        SuccessRespnose.data = responseData;
    
        Logger.info(`User Status-> ${uid} updated successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);
      } else {
        // update password
        const newPassword = bodyReq.newPassword; 
  
        user.actual_password = newPassword;
        await userRepo.update(uid, { actual_password: user.actual_password });
  
        user.password = newPassword;
        await userRepo.update(uid, { password: user.password });
  
        SuccessRespnose.message = "User Password Updated Successfully!";
        SuccessRespnose.data = responseData;
    
        Logger.info(`User Password -> ${uid} updated successfully`);
        return res.status(StatusCodes.OK).json(SuccessRespnose);
      }
  
    } catch (error) {
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name == "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "User not found";
      } else if (error.name == "MongoServerError") {
        statusCode = StatusCodes.BAD_REQUEST;
        if(error.codeName == "DuplicateKey")
          errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
      ErrorResponse.message = errorMsg;
  
      Logger.error(
        `User -> unable to update user status / password of user ${uid}, data: ${JSON.stringify(
          bodyReq
        )}, error: ${JSON.stringify(error)}`
      );
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }


  async function switchUser(req, res) {
    const { id } = req.body;
    const targetUser = await userRepo.get(id);
    const user = await userRepo.getByUsername(targetUser.username);
  
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    const userData = await user.generateUserData(true);
  
    SuccessRespnose.message = "Successfully signed in";
    SuccessRespnose.data = userData;
  
    Logger.info(`User -> ${JSON.stringify(userData)} login successfully`);
  
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  }
  module.exports = {
    get,
    signinUser,
    getAll,
    logoutUser,
    deleteUser,
    statusPasswordUpdateUser,
    switchUser

  }