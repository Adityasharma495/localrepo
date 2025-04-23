const { StatusCodes } = require("http-status-codes");
const bcrypt = require('bcrypt');
const { UserRepository, CompanyRepository,UserJourneyRepository, LicenceRepository
  , SubUserLicenceRepository, CallCentreRepository} = require("../repositories");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../utils/common");
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");
const {MODULE_LABEL, ACTION_LABEL, USERS_ROLE, PREFIX_VALUE, SUB_LICENCE_ROLE, USER_ROLE_VALUE_LICENCE} = require('../utils/common/constants');

const userRepo = new UserRepository();
const companyRepo = new CompanyRepository();
const userJourneyRepo = new UserJourneyRepository();
const licenceRepo = new LicenceRepository();
const subUserLicenceRepo = new SubUserLicenceRepository();
const callCentreRepo = new CallCentreRepository();


async function signupUser(req, res) {
  const bodyReq = req.body;
  console.log('bodyReq', bodyReq)
  try {
    const responseData = {};
    let user;
    let subUserLicenceId;


    //sub user licence
    if (SUB_LICENCE_ROLE.includes(req.user.role)) {
      //fetch logged in user sub licence data
      const loggedInData = await userRepo.getForLicence(req.user.id)

      //fetch logged in user sub licence data(available_licence)
      const subLicenceData = loggedInData.sub_user_licence_id.available_licence
      
      // if available_licence are 0 then return
      if (Number(subLicenceData[bodyReq.user.role]) === 0) {
         ErrorResponse.message = 'Licence is not available';
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
      }
      await subUserLicenceRepo.updateById(loggedInData.sub_user_licence_id._id, {available_licence: bodyReq.user.parent_licence})

    }

    if (req.user.role === USERS_ROLE.COMPANY_ADMIN && bodyReq.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      const campanyAdmin = await userRepo.get(req.user.id)
      const prefix = campanyAdmin.prefix + PREFIX_VALUE
      bodyReq.user.prefix = prefix

      user = await userRepo.create(bodyReq.user);
      await userRepo.update(req.user.id, {prefix: prefix})
    } else {
      user = await userRepo.create(bodyReq.user);
    }

    // insert sub user licence when user created by reseller
    if (req.user.role === USERS_ROLE.RESELLER || SUB_LICENCE_ROLE.includes(req.user.role)) {
      const data = await subUserLicenceRepo.create({
        user_id : user._id,
        total_licence: bodyReq.user.sub_licence,
        available_licence: bodyReq.user.sub_licence,
        created_by: req.user.id
      })

      subUserLicenceId = data._id
      await userRepo.update(user._id, {sub_user_licence_id: subUserLicenceId})
    }
       
    responseData.user = await user.generateUserData();

    if (bodyReq.company && bodyReq.user.role !== USERS_ROLE.CALLCENTRE_ADMIN) {
      //Add the created user as a reference to the company
      await companyRepo.addUserIds(bodyReq.company , user._id)

      const companyDetail = await companyRepo.get(bodyReq.company);

      const companyToadd = {
        name: companyDetail.name,
        _id : companyDetail._id
      }
      await userRepo.update(user._id, {
        companies: companyToadd
      })
      responseData.company = companyDetail;
    }

    if (bodyReq.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      //Add the created user as a reference to the Callcenters
      await callCentreRepo.addUserIds(bodyReq.callcenterId , user._id)
      const callcenterDetail = await callCentreRepo.get(bodyReq.callcenterId);
      const callcenterToadd = {
        name: callcenterDetail.name,
        _id : callcenterDetail._id
      }
      await userRepo.update(user._id, {
        callcenters: callcenterToadd
      })
      responseData.callcenterToadd = callcenterDetail;
    }

    const userJourneyfields = {
      module_name: MODULE_LABEL.USERS,
      action: ACTION_LABEL.ADD,
      created_by:  req?.user?.id
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
          created_by:  userData._id
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

    Logger.info(
      `User -> recieved all successfully`
    );

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

    const availLicence = await licenceRepo.findOne({user_id : uid})
    userData.licence = availLicence?.total_licence

    if (req.user.role === USERS_ROLE.RESELLER) {
      const subUserLicence = await subUserLicenceRepo.findOne({user_id : uid})
      userData.sub_licence = subUserLicence
    }

    SuccessRespnose.message = "Success";
    SuccessRespnose.data = userData;

    Logger.info(
      `User -> recieved ${uid} successfully`
    );

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
    let userData;
    
    // only update licence in case if reseller (reseller only update by superadmin or subsuperadmin)
    if (req.user.role === USERS_ROLE.SUPER_ADMIN || req.user.role === USERS_ROLE.SUB_SUPERADMIN || req.user.role === USERS_ROLE.RESELLER) {
      const user = await userRepo.update(uid, bodyReq.user);
      userData = await user.generateUserData();
      responseData.user = userData
    
      if (req.user.role === USERS_ROLE.RESELLER) {
        const loggedInData = await userRepo.getForLicence(uid)
        const total_licence = loggedInData.sub_user_licence_id.total_licence

        const available_licence = loggedInData.sub_user_licence_id.available_licence

        const used_licence = Object.keys(total_licence).reduce((acc, key) => {
          acc[key] = total_licence[key] - (available_licence[key] || 0);
          return acc;
        }, {});

        const updated_licence = bodyReq.user.sub_licence

        // Compare each role and return immediately if an error is found
        for (const key of Object.keys(used_licence)) {
          if (used_licence[key] > (updated_licence[key] || 0)) {
            ErrorResponse.message = `Can't Set ${USER_ROLE_VALUE_LICENCE[key]} Licence Because used licence Are greater.`;
            return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json(ErrorResponse);
          }
        }

        const newAvailLicence = Object.keys(bodyReq.user.sub_licence).reduce((acc, key) => {
          acc[key] = bodyReq.user.sub_licence[key] - (used_licence[key] || 0);
          return acc;
        }, {});

        await subUserLicenceRepo.update(uid,
          {
            available_licence: newAvailLicence,
            total_licence: bodyReq.user.sub_licence
        })


      }

    } else {
      const loggedInData = await userRepo.getForLicence(uid)
      const total_licence = loggedInData.sub_user_licence_id.total_licence
      const available_licence = loggedInData.sub_user_licence_id.available_licence

      const used_licence = Object.keys(total_licence).reduce((acc, key) => {
        acc[key] = total_licence[key] - (available_licence[key] || 0);
        return acc;
      }, {});


      const updated_licence = bodyReq.user.sub_licence

      // Compare each role and return immediately if an error is found
      for (const key of Object.keys(used_licence)) {
        if (used_licence[key] > (updated_licence[key] || 0)) {
          ErrorResponse.message = `Can't Set ${USER_ROLE_VALUE[key]} Licence Because used licence Are greater.`;
          return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
      }

      const newAvailLicence = Object.keys(bodyReq.user.sub_licence).reduce((acc, key) => {
        acc[key] = bodyReq.user.sub_licence[key] - (used_licence[key] || 0);
        return acc;
      }, {});

      await subUserLicenceRepo.update(uid,
        {
          available_licence: newAvailLicence,
          total_licence: bodyReq.user.sub_licence
      })


      const user = await userRepo.update(uid, bodyReq.user);
      userData = await user.generateUserData();
      responseData.user = userData
    
      await subUserLicenceRepo.update(req.user.id, {available_licence: bodyReq.user.parent_licence})
    }

    // if company is updated than remove user from old company and add to new
    if (bodyReq.company) {
      if ((userData.companies._id).toString() !== (bodyReq.company).toString()) {
        await companyRepo.removeUserId(userData.companies._id , userData._id)
        await companyRepo.addUserIds(bodyReq.company , userData._id)
        const companyDetail = await companyRepo.get(bodyReq.company);
        const companyToadd = {
          name: companyDetail.name,
          _id : companyDetail._id
        }
        await userRepo.update(userData._id, {
          companies: companyToadd
        })
        responseData.company = companyDetail;
      }
    }



    const userJourneyfields = {
      module_name: MODULE_LABEL.USERS,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id
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

async function deleteUser(req, res) {
  const userIds = req.body.userIds;
  let response

  try {
    
    if (req.user.role === USERS_ROLE.SUPER_ADMIN || req.user.role === USERS_ROLE.SUB_SUPERADMIN) {
      for (const userId of userIds) {
        const data = await userRepo.findOne({ created_by: userId });
        if (data) {
          ErrorResponse.message = `Child Present Of ${data.username}, Can't Deleted`;
          return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
      } 
      await userRepo.deleteMany(userIds, req.user);
    } else {
      for (const userId of userIds) {
        const data = await userRepo.findOne({ created_by: userId });
        if (data) {
          ErrorResponse.message = `Child Present Of ${data.username}, Can't Deleted`;
          return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
      } 

      if (req.user.role === USERS_ROLE.RESELLER) {
        response = await userRepo.deleteMany(userIds, req.user);
      } else {
        response = await userRepo.deleteMany(userIds, req.user);
        for (const userId of userIds) {
          const loggedInData = await userRepo.getForLicence(req.user.id);
          const availableLicence = loggedInData.sub_user_licence_id.available_licence;
          const data = await userRepo.getForLicence(userId);
          let updatedData = { ...availableLicence };
          updatedData[data.role] = (updatedData[data.role] || 0) + 1;
          await subUserLicenceRepo.updateById(loggedInData.sub_user_licence_id._id, {available_licence: updatedData})
        }
      }
    }

      for (const userId of userIds) {
        const data = await userRepo.findOneAll({_id: userId});
        if (data?.companies?._id) {
          await companyRepo.removeUserId(data.companies._id, userId);
        }
    }

    const userJourneyfields = {
      module_name: MODULE_LABEL.USERS,
      action: ACTION_LABEL.DELETE,
      created_by:  req?.user?.id
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
      created_by:  req.user.id
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
  statusPasswordUpdateUser
};
