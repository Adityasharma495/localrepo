const { UserRepository, CompanyRepository, SubUserLicenceRepository, CallCentreRepository , AgentRepository} = require("../../shared/c_repositories")
const { UserJourneyRepository , LicenceRepository} = require("../../shared/c_repositories")
const { StatusCodes } = require("http-status-codes");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");

const { Logger } = require("../../shared/config");
const AppError = require("../../shared/utils/errors/app-error");
const { MODULE_LABEL, ACTION_LABEL, USERS_ROLE, PREFIX_VALUE, SUB_LICENCE_ROLE, USER_ROLE_VALUE } = require('../../shared/utils/common/constants');
const UserCompany = require("../../shared/c_db/user-companies");
const { UserCallCentres } = require("../../shared/c_db");
const { Op } = require("sequelize");

const userRepo = new UserRepository();
const licenceRepo = new LicenceRepository();
const companyRepo = new CompanyRepository();
const userJourneyRepo = new UserJourneyRepository();
const subUserLicenceRepo = new SubUserLicenceRepository();
const callCentreRepo = new CallCentreRepository();
const agentRepo = new AgentRepository();


async function signinUser(req, res) {

  const bodyReq = req.body;
  const username = bodyReq.username;


  try {
    //Fetch user via username
    const user = await userRepo.getByUsername(username);

    console.log("USER NAME", user);
        if (user?.role === USERS_ROLE.CALLCENTRE_AGENT) {
          const subLicenceData = await subUserLicenceRepo.findOne({user_id : user?.created_by})
        
          if (subLicenceData.available_licence.live_agent !== 0) {
            subLicenceData.available_licence.live_agent = subLicenceData.available_licence.live_agent - 1;
          } else {
            ErrorResponse.message = 'Agent Live Limit Exceeds';
              return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
          }
      
          //update sub user licence
          await subUserLicenceRepo.updateById(subLicenceData.id, {available_licence: subLicenceData.available_licence})
          const agentData = await agentRepo.getByName(user?.name)
          await agentRepo.update(agentData.id, {
            login_status : "1"
          })
        }
        
        
        const userLoginCount = await userRepo.find({
          where: { 
            id: user.id,
            logout_at: null  
          }
        });
    
          if (userLoginCount && userLoginCount > 0) {
            ErrorResponse.message = 'User already logged in';
            return res
              .status(StatusCodes.BAD_REQUEST)
              .json(ErrorResponse);
          }

    if (user) {
      // if (user.isValidLogin() == false)
      //   throw new AppError("Inactive or deleted user", StatusCodes.FORBIDDEN);
      const isPasswordMatch = await user.comparePassword(bodyReq.password);

      if (isPasswordMatch) {

        const userData = await user.generateUserData(true);


        console.log("USER DATA",typeof userData);

        SuccessRespnose.message = "Successfully signed in";
        SuccessRespnose.data = userData;

        const userJourneyfields = {
          module_name: MODULE_LABEL.USERS,
          action: ACTION_LABEL.LOGIN,
          created_by: userData.id
        }


        await userJourneyRepo.create(userJourneyfields);

        userRepo.update(user.id, {
          login_at: Date.now(),
          logout_at: null,
          duration: null
        })

        Logger.info(`User -> ${userData.id} login successfully`);

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
      let response;


      if (userRole === "noRole") {
          response = await userRepo.getAll();
      } else {
          response = await userRepo.getAllByRoles(
              req.user.id,
              req.user.role,
              userRole
          );
      }

      SuccessRespnose.data =response;

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
  const id = req.params.id

  try {
    const userData = await userRepo.get(id);
    const duration = getTimeDifferenceInSeconds(userData.login_at, userData.logout_at)

    if (userData?.role === USERS_ROLE.CALLCENTRE_AGENT) {
      const subLicenceData = await subUserLicenceRepo.findOne({ user_id: userData?.created_by });
      const agentData = await agentRepo.getByName(userData?.name)
      subLicenceData.available_licence.live_agent += 1;

      await subUserLicenceRepo.update(subLicenceData.id, { available_licence: subLicenceData.available_licence });
      await agentRepo.update(agentData.id, {
        login_status : "0"
      })
    }

    await userRepo.update(id, {
      duration
    })

    await userRepo.update(id, {
      logout_at: Date.now(),
    })

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


async function get(req, res) {
  const uid = req.params.id;
  try {
    const user = await userRepo.get(uid);

    let userData = await user.generateUserData();

    const availLicence = await licenceRepo.findOne({ user_id: uid })

    userData.licence = availLicence?.total_licence

    if (req.user.role === USERS_ROLE.RESELLER) {
      const subUserLicence = await subUserLicenceRepo.findOne({ user_id: uid })
      userData.sub_licence = subUserLicence
    }



    if (userData.companies && userData.companies.id) {
      userData.companies._id = userData.companies.id;
      delete userData.companies.id;
    }
    if (userData.acl_settings && userData.acl_settings.id) {
      userData.acl_settings._id = userData.acl_settings.id;
      delete userData.acl_settings.id;
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
          await licenceRepo.updateByUserId(userId, { is_deleted: true });
        }
      }

      // Check if reseller has any child if yes don't delete reseller
      for (const userId of userIds) {

        const data = await userRepo.findOne({ created_by: userId });

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



        const availableLicence = loggedInData.sub_user_licence.available_licence;




        const data = await userRepo.findOneDeleted({ id: userId });



        let updatedData = { ...availableLicence };
        updatedData[data.role] = (updatedData[data.role] || 0) + 1;
        await subUserLicenceRepo.updatelicence(loggedInData.sub_user_licence.id, { available_licence: updatedData })
      }
    }

    const userJourneyfields = {
      module_name: MODULE_LABEL.USERS,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id
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
      if (user.status == 1) {
        user.status = 0;
      }
      else {
        user.status = 1;
      }
      await userRepo.update(uid, { status: user.status });

      const userJourneyfields = {
        module_name: MODULE_LABEL.USERS,
        action: ACTION_LABEL.STATUS_UPDATE,
        created_by: req?.user?.id
      }

      const userJourney = await userJourneyRepo.create(userJourneyfields);
      responseData.userJourney = userJourney


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
      if (error.codeName == "DuplicateKey")
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
  try {
    const { id } = req.body;
    const targetUser = await userRepo.get(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await userRepo.getByUsername(targetUser.username);

    if (user?.role === USERS_ROLE.CALLCENTRE_AGENT) {
      const subLicenceData = await subUserLicenceRepo.findOne({ user_id: user?.created_by });
    
          if (subLicenceData.available_licence.live_agent !== 0) {
            subLicenceData.available_licence.live_agent -= 1;
          } else {
            ErrorResponse.message = 'Agent Live Limit Exceeds';
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
          }
    
          // Update sub user licence
          await subUserLicenceRepo.updateById(subLicenceData.id, { available_licence: subLicenceData.available_licence });
    
          const agentData = await agentRepo.getByName(user?.name)
          await agentRepo.update(agentData.id, {
            login_status : "1"
          })
        }
    
        const userLoginCount = await userRepo.find({
          where: {
            id: user.id,
            logout_at: null
          }
        });
    
        if (userLoginCount && userLoginCount.length > 0) {
          ErrorResponse.message = 'User already logged in';
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

  const userData = await user.generateUserData(true);

  await userRepo.update(user.id, {
    login_at: Date.now(),
    logout_at: null,
    duration: null
  });

  SuccessRespnose.message = "Successfully signed in";
  SuccessRespnose.data = userData;

  Logger.info(`User -> ${JSON.stringify(userData)} login successfully`);

  return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.error('Error in switchUser:', error);
    ErrorResponse.message = error.message || 'Something went wrong';
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function licenceCreated(bodyReq, loggedUser, userCreated) {

  try {
    if (loggedUser.role !== USERS_ROLE.SUPER_ADMIN && loggedUser.role !== USERS_ROLE.SUB_SUPERADMIN) {
      // add licence for new user created
      const licenceData = {
        user_type: userCreated.role,
        user_id: userCreated._id,
        total_licence: bodyReq.user.licence,
        availeble_licence: bodyReq.user.licence,
        createdBy: loggedUser.id
      }
      await licenceRepo.create(licenceData)

      //update licence for parent 
      const data = await licenceRepo.findOne({ user_id: loggedUser.id })
      await licenceRepo.updateByUserId(loggedUser.id, {
        availeble_licence: data.availeble_licence - 1
      })
    } else {
      const licenceData = {
        user_type: userCreated.role,
        user_id: userCreated.id,
        total_licence: bodyReq.user.licence,
        availeble_licence: bodyReq.user.licence,
        createdBy: loggedUser.id
      }

      await licenceRepo.create(licenceData)

    }
  } catch (error) {
    throw error
  }
}



async function signupUser(req, res) {
  const bodyReq = req.body;
  if (bodyReq?.user?.acl_settings) {
    bodyReq.user.acl_settings_id = bodyReq?.user?.acl_settings;
  }

  try {
    const existingUserData = await userRepo.findOne({
      [Op.and]: [
        { created_by: req.user.id },
        {
          [Op.or]: [
            { username: bodyReq?.user?.username?.trim() },
            { email: bodyReq?.user?.email?.trim() }
          ]
        }
      ]
    });
    
    if (existingUserData) {
      ErrorResponse.message = 'User With Same Username or Email Already exists.';
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    const responseData = {};
    let user;
    let subUserLicenceId;

    if (SUB_LICENCE_ROLE.includes(req.user.role)) {

      //fetch logged in user sub licence data
      const loggedInData = await userRepo.getForLicence(req.user.id)


      //fetch logged in user sub licence data(available_licence)
      const subLicenceData = loggedInData.sub_user_licence.available_licence

      // if available_licence are 0 then return
      if (Number(subLicenceData[bodyReq.user.role]) === 0) {
        ErrorResponse.message = 'Licence is not available';
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ErrorResponse);
      }

      // if available_licence are not 0 then update sub user licence
      // const updatedData = {
      //   ...subLicenceData, 
      //   [bodyReq.user.role]: Number(subLicenceData[bodyReq.user.role] || 0) - 1
      // };
      // bodyReq.user.sub_user_licence_id = loggedInData.sub_user_licence_id._id

     const sub = await subUserLicenceRepo.updateById(loggedInData.sub_user_licence.id, { available_licence: bodyReq.user.parent_licence })
  
    }


    if (req.user.role === USERS_ROLE.COMPANY_ADMIN && bodyReq.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      const campanyAdmin = await userRepo.get(req.user.id)
      const prefix = Number(campanyAdmin.prefix) + PREFIX_VALUE

      bodyReq.user.prefix = prefix

      user = await userRepo.create(bodyReq.user);
      // await licenceCreated(bodyReq, req.user, user);
      await userRepo.update(req.user.id, { prefix: prefix })
    } else {
      user = await userRepo.create(bodyReq.user);
      // await licenceCreated(bodyReq, req.user, user);
    }


    if (req.user.role === USERS_ROLE.RESELLER || SUB_LICENCE_ROLE.includes(req.user.role)) {
      const data = await subUserLicenceRepo.create({
        user_id: user.id,
        total_licence: bodyReq.user.sub_licence,
        available_licence: bodyReq.user.sub_licence,
        created_by: req.user.id
      })


      subUserLicenceId = data.id


      await userRepo.update(user.id, { sub_user_licence_id: subUserLicenceId })
    }

    if (SUB_LICENCE_ROLE.includes(req.user.role)) {

      const loggedInData = await userRepo.getForLicence(req.user.id);
      const availableLicences = loggedInData.sub_user_licence.available_licence;
      const subLicence = bodyReq.user.sub_licence;
  

      const updatedAvailableLicences = {};
      for (const key in availableLicences) {
        const currentAvailable = Number(availableLicences[key] || 0);
        const toSubtract = Number(subLicence[key] || 0);
        const updated = currentAvailable - toSubtract;
    
        updatedAvailableLicences[key] = updated < 0 ? 0 : updated;
      }
    
      await subUserLicenceRepo.update(loggedInData.sub_user_licence.id, {
        available_licence: updatedAvailableLicences,
      });
    }

    // Create license if a SUPER_ADMIN or SUB_SUPERADMIN creates a reseller
    if ([USERS_ROLE.SUPER_ADMIN, USERS_ROLE.SUB_SUPERADMIN].includes(req.user.role)) {

      const licencse = await licenceCreated(bodyReq, req.user, user);
      console.log("LICE");
    }

    if (bodyReq.company && req.user.role !== USERS_ROLE.CALLCENTRE_ADMIN) {

      const companyDetail = await companyRepo.findOne({ id: bodyReq.company })
      const companyId = companyDetail.id
      await UserCompany.create({
        user_id: user.id,
        company_id: companyId
      });

      const companyToadd = {
        name: companyDetail.name,
        _id: companyDetail.id
      }

      
      await userRepo.update(user.id, {
        companies: companyToadd
      })
      responseData.company = companyDetail;


    }

    if (bodyReq.callcenterId && req.user.role !== USERS_ROLE.CALLCENTRE_ADMIN) {

      const CallCentreDetail = await callCentreRepo.findOne({ id: bodyReq.callcenterId })

      const CallCentreId = CallCentreDetail.id

      await UserCallCentres.create({
        user_id: user.id,
        call_centre_id: CallCentreId
      });

      const CallCentreToAdd = {
        name: CallCentreDetail.name,
        _id: CallCentreDetail.id
      }

      await userRepo.update(user.id, {
        call_centres: CallCentreToAdd
      })

      responseData.callcenterId = CallCentreDetail;
    }

    responseData.user = await user.generateUserData();

    
    responseData.userJourney = await userJourneyRepo.create({
      module_name: MODULE_LABEL.USERS,
      action: ACTION_LABEL.ADD,
      created_by: req.user.id
    });

    return res.status(StatusCodes.CREATED).json({
      message: "User Created successfully!",
      data: responseData
    });
  } catch (error) {
    console.error(`Error during user signup: ${error}`);
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "SequelizeUniqueConstraintError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = `Duplicate key, record already exists for ${Object.keys(
        error.fields
      ).join(", ")}`;
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;
    return res.status(statusCode).json(ErrorResponse);
  }
}


async function updateUser(req, res) {


  const uid = req.params.id;

  const bodyReq = req.body;



  if (bodyReq?.user?.acl_settings) {
    bodyReq.user.acl_settings_id = bodyReq?.user?.acl_settings;
  }

  try {

    const existingUserData = await userRepo.findOne({
      created_by: req.user.id,
      id: { [Op.ne]: uid },
      [Op.or]: [
        { username: bodyReq?.user?.username?.trim() },
        { email: bodyReq?.user?.email?.trim() }
      ]
    });
    
    if (existingUserData) {
      ErrorResponse.message = 'User With Same Username or Email Already exists.';
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }

    const responseData = {};

    // only update licence in case if reseller (reseller only update by superadmin or subsuperadmin)
    if (req.user.role === USERS_ROLE.SUPER_ADMIN || req.user.role === USERS_ROLE.SUB_SUPERADMIN || req.user.role === USERS_ROLE.RESELLER) {

      if((req.user.role === USERS_ROLE.SUB_SUPERADMIN || req.user.role === USERS_ROLE.RESELLER) && bodyReq.company)
      {
        const companyDetail = await companyRepo.findOne({ id: bodyReq.company }) 
        const companyId = companyDetail.id 

        

        if (companyId) {
          const existingUserCompany = await UserCompany.findOne({
            where: {
              user_id: uid
            }
          });
        
          if (existingUserCompany) {
            const data = await UserCompany.update(
              { company_id: companyId },
              {
                where: { user_id: uid }
              }
            )
          } else {
            await UserCompany.create({
              user_id: uid,
              company_id: companyId
            });
          }
        }
  
        const companyToadd = {
          name: companyDetail.name,
          _id : companyDetail.id
        }
  
        bodyReq.user.company = companyToadd;
      }

      console.log("BODY REQ<USE", bodyReq.user);
      const update = await userRepo.update(uid, bodyReq.user);
      const userInstance = await userRepo.get(uid);
      responseData.user = await userInstance.generateUserData();


      // if (bodyReq.user.company) {
      //   await companyRepo.update(bodyReq.user.company.id, bodyReq.user.company);
      //   const updatedCompanyInstance = await companyRepo.get(bodyReq.user.company.id);

      //   const updatedCompany = updatedCompanyInstance.get({ plain: true });


      //   bodyReq.user.companies = {
      //     id: updatedCompany.id,
      //     name: updatedCompany.name,
      //     phone: updatedCompany.phone,
      //     pincode: updatedCompany.pincode,
      //     address: updatedCompany.address
      //   };
      // }


      // await userRepo.update(uid, bodyReq.user);



      if (req.user.role === USERS_ROLE.RESELLER) {

        const loggedInData = await userRepo.getForLicence(uid)

        const total_licence = loggedInData.sub_user_licence.total_licence


        const available_licence = loggedInData.sub_user_licence.available_licence



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

        await subUserLicenceRepo.updatelicence(uid,
          {
            available_licence: newAvailLicence,
            total_licence: bodyReq.user.sub_licence
          })
      }

    } else {

      
      const loggedInData = await userRepo.getForLicence(uid); // child
      const childOldLicence = loggedInData.sub_user_licence.total_licence;


      console.log("LOGGED IN DATA", loggedInData);
      console.log("CHILD OLD LIC", childOldLicence);

      // Get parent licence
      const parentUserId = loggedInData.created_by;
      const parentData = await userRepo.getForLicence(parentUserId);

      console.log("PARENT DATA", parentData);
      const parentAvailableLicence = parentData.sub_user_licence.available_licence;

      console.log("PARENT AVAIL LICE", parentAvailableLicence);
      
      //Calculate difference & update parent
      const newChildLicence = bodyReq.user.sub_licence;
      const updatedParentAvailable = { ...parentAvailableLicence };

      console.log("UPDATED PARE", updatedParentAvailable);


      Object.keys(newChildLicence).forEach((key) => {
        const oldValue = Number(childOldLicence[key] || 0);
        const newValue = Number(newChildLicence[key] || 0);
        const diff = newValue - oldValue;
    
        // Parent licence decreases if diff > 0, increases if diff < 0
        updatedParentAvailable[key] = (parentAvailableLicence[key] || 0) - diff;
    });

    console.log("✅ Final Updated Parent Available Licence: ", updatedParentAvailable);
      

      // console.log("LOGGED IN DATA", loggedInData);

      // const total_licence = loggedInData.sub_user_licence.total_licence
      // const available_licence = loggedInData.sub_user_licence.available_licence

      // console.log("TOTAL LIC", total_licence);
      // console.log("AVAIL LIC", available_licence);



      // const used_licence = Object.keys(total_licence).reduce((acc, key) => {
      //   acc[key] = total_licence[key] - (available_licence[key] || 0);
      //   return acc;
      // }, {});


      // console.log("USED LICENCE", used_licence);


      // const updated_licence = bodyReq.user.sub_licence


      // console.log("UPDATED LICE", updated_licence);


      // // Compare each role and return immediately if an error is found
      // for (const key of Object.keys(used_licence)) {
      //   if (used_licence[key] > (updated_licence[key] || 0)) {
      //     ErrorResponse.message = `Can't Set ${USER_ROLE_VALUE[key]} Licence Because used licence Are greater.`;
      //     return res
      //       .status(StatusCodes.BAD_REQUEST)
      //       .json(ErrorResponse);
      //   }
      // }


      // const newAvailLicence = Object.keys(bodyReq.user.sub_licence).reduce((acc, key) => {
      //   acc[key] = bodyReq.user.sub_licence[key] - (used_licence[key] || 0);
      //   return acc;
      // }, {});


      // console.log("NEW AVAIL LIC", newAvailLicence);



      await subUserLicenceRepo.updateById(
        parentData.sub_user_licence.id,
        {
            available_licence: updatedParentAvailable
        }
    );
    
    // Update child licence (both total & available)
    await subUserLicenceRepo.updateById(
        loggedInData.sub_user_licence.id,
        {
            available_licence: newChildLicence,
            total_licence: newChildLicence
        }
    );



      if(bodyReq.user.company)
        {
          
          const companyDetail = await companyRepo.findOne({ id: bodyReq.company }) 
          const companyId = companyDetail.id 
  
          if (companyId) {
            const existingUserCompany = await UserCompany.findOne({
              where: {
                user_id: uid
              }
            });
          
            if (existingUserCompany) {
              const data = await UserCompany.update(
                { company_id: companyId },
                {
                  where: { user_id: uid }
                }
              )
            } else {
              await UserCompany.create({
                user_id: uid,
                company_id: companyId
              });
            }
          }
    
          const companyToadd = {
            name: companyDetail.name,
            _id : companyDetail.id
          }
    
          bodyReq.user.company = companyToadd;
        }


        await userRepo.update(uid, bodyReq.user);


        const userInstance = await userRepo.get(uid);
        responseData.user = await userInstance.generateUserData();

      await subUserLicenceRepo.updatelicence(req.user.id, { available_licence: bodyReq.user.parent_licence })
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
    Logger.error(
      `User -> unable to update user: ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    if (error.name === "SequelizeUniqueConstraintError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = `Duplicate key, record already exists for ${Object.keys(
        error.fields
      ).join(", ")}`;
    }
    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;
    return res.status(statusCode).json(ErrorResponse);
  }
}

function getTimeDifferenceInSeconds(start, end) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  if (isNaN(startTime) || isNaN(endTime)) return 0;

  return Math.floor((endTime - startTime) / 1000);
}

module.exports = {
  get,
  signinUser,
  getAll,
  logoutUser,
  deleteUser,
  statusPasswordUpdateUser,
  switchUser,
  signupUser,
  updateUser

}