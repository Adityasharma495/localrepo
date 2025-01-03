const { StatusCodes } = require("http-status-codes");
const { UserRepository, CompanyRepository,UserJourneyRepository, LicenceRepository } = require("../repositories");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../utils/common");
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");
const {MODULE_LABEL, ACTION_LABEL, USERS_ROLE, PREFIX_VALUE} = require('../utils/common/constants');

const userRepo = new UserRepository();
const companyRepo = new CompanyRepository();
const userJourneyRepo = new UserJourneyRepository();
const licenceRepo = new LicenceRepository();

async function signupUser(req, res) {
  const bodyReq = req.body;
  
  try {
    const responseData = {};
    let user;

    if (req.user.role !== USERS_ROLE.SUPER_ADMIN && req.user.role !== USERS_ROLE.SUB_SUPERADMIN) {
      const availLicence = await licenceRepo.findOne({user_id : req.user.id})

      if (availLicence && availLicence.availeble_licence === 0) {
        ErrorResponse.message = 'Licence is not available';
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
      }
    }

     
    if (req.user.role === USERS_ROLE.COMPANY_ADMIN && bodyReq.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      const campanyAdmin = await userRepo.get(req.user.id)
      const prefix = campanyAdmin.prefix + PREFIX_VALUE
      bodyReq.user.prefix = prefix

      user = await userRepo.create(bodyReq.user);
      await licenceCreated(bodyReq, req.user, user);
      await userRepo.update(req.user.id, {prefix: prefix})


    } else {
      user = await userRepo.create(bodyReq.user);
      await licenceCreated(bodyReq, req.user, user);
    }
    
    responseData.user = await user.generateUserData();

    if (bodyReq.company) {
      //Add the created user as a reference to the company
      bodyReq.company.users = [user._id];
      responseData.company = await companyRepo.create(bodyReq.company);
    }

    const userJourneyfields = {
      module_name: MODULE_LABEL.USERS,
      action: ACTION_LABEL.ADD,
      createdBy:  req?.user?.id
    }

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney

    SuccessRespnose.message = "User Created successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(
      `User -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `User -> unable to create user: ${JSON.stringify(
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

async function licenceCreated(bodyReq, loggedUser, userCreated) {
  try {

    if (loggedUser.role !== USERS_ROLE.SUPER_ADMIN && loggedUser.role !== USERS_ROLE.SUB_SUPERADMIN) {
      // add licence for new user created
      const licenceData = {
        user_type: userCreated.role,
        user_id : userCreated._id,
        total_licence: bodyReq.user.licence,
        availeble_licence: bodyReq.user.licence
      }
      await licenceRepo.create(licenceData)

      //update licence for parent 
      const data = await licenceRepo.findOne({user_id : loggedUser.id}) 
      await licenceRepo.updateByUserId(loggedUser.id, {
        availeble_licence : data.availeble_licence - 1
      })
    } else {
      const licenceData = {
        user_type: userCreated.role,
        user_id : userCreated._id,
        total_licence: bodyReq.user.licence,
        availeble_licence: bodyReq.user.licence
      }
      await licenceRepo.create(licenceData)
    }
  } catch (error) {
    throw error
  }
}

async function signinUser(req, res) {
  const bodyReq = req.body;
  const username = bodyReq.username;

  try {
    //Fetch user via username
    const user = await userRepo.getByUsername(username);
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

async function get(req, res) {
  const uid = req.params.id;

  try {
    const user = await userRepo.get(uid);
    let userData = await user.generateUserData();
    userData.companies = user.companies 

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

async function updateUser(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};
    const user = await userRepo.update(uid, bodyReq.user);
    // licence update
    const savedLicence = await licenceRepo.findOne({createdBy: uid , is_deleted : false})
    if (Number(bodyReq.user.licence) < Number(savedLicence.total_licence - savedLicence.availeble_licence)) {
      ErrorResponse.message = `Can't Set Licence Because used licence Are greater.`;
      return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    const licenceData = {
      user_type: userCreated.role,
      total_licence: bodyReq.user.licence,
      availeble_licence: bodyReq.user.licence - (savedLicence.total_licence - savedLicence.availeble_licence) 
    }

    const data = await licenceRepo.findOne({user_id : uid}) 
    if (data) {
      await licenceRepo.updateByUserId(uid, licenceData)
    }
    responseData.user = await user.generateUserData();
    
    if (bodyReq.company) {
      responseData.company = await companyRepo.update(
        bodyReq.company.id,
        bodyReq.company
      );
    }

    const userJourneyfields = {
      module_name: MODULE_LABEL.USERS,
      action: ACTION_LABEL.EDIT,
      createdBy: req?.user?.id
    }

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney

    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`User -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "User not found";
    } else if (error.name == "MongoServerError") {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == "DuplicateKey")
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `User -> unable to update user: ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function blockUser(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};
    const user = await userRepo.get(uid);
    // update status

    if(user.status == 1){
      user.status = 0;
    }
    // else{
    //   user.status = 1;
    // }

    await userRepo.update(uid, { status: user.status });

    SuccessRespnose.message = "User Status Updated Successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`User Status-> ${uid} updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

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
      `User -> unable to update user status of user ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteUser(req, res) {
  const userIds = req.body.userIds;

  try {
    const response = await userRepo.deleteMany(userIds, req.user);
     
    if (req.user.role !== USERS_ROLE.SUPER_ADMIN && req.user.role !== USERS_ROLE.SUB_SUPERADMIN) {
      //update licence for parent 
      const data = await licenceRepo.findOne({ user_id: req.user.id });
      if (data) {
            await licenceRepo.updateByUserId(req.user.id, {
                availeble_licence: data.availeble_licence + 1
            });
      }

      //Delete for current users
      for (const userId of userIds) {
        const data = await licenceRepo.findOne({ user_id: userId });
        if (data) {
            await licenceRepo.updateByUserId(userId, {is_deleted: true});
        }
      }
    } else {
      //Delete for current users
      for (const userId of userIds) {
        const data = await licenceRepo.findOne({ user_id: userId });
        if (data) {
            await licenceRepo.updateByUserId(userId, {is_deleted: true});
        }
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

async function logoutUser(req, res) {

  try {
    const userJourneyfields = {
      module_name: MODULE_LABEL.USERS,
      action: ACTION_LABEL.LOGOUT,
      createdBy:  req.user.id
    }

    await userJourneyRepo.create(userJourneyfields);
    Logger.info(`User -> ${req.user.id} Logout successfully`);

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
      `User -> unable to logout user: ${req.user.id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  signupUser,
  signinUser,
  getAll,
  get,
  updateUser,
  deleteUser,
  switchUser,
  logoutUser,
  blockUser
};
