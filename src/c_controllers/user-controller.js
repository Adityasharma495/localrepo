const { UserRepository, CompanyRepository, SubUserLicenceRepository, CallCentreRepository , AgentRepository} = require("../../shared/c_repositories")
const { UserJourneyRepository } = require("../../shared/c_repositories")
const { StatusCodes } = require("http-status-codes");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");

const { Logger } = require("../../shared/config");
const AppError = require("../../shared/utils/errors/app-error");
const { MODULE_LABEL, ACTION_LABEL, USERS_ROLE, PREFIX_VALUE, SUB_LICENCE_ROLE, USER_ROLE_VALUE, USER_ROLE_VALUE_LICENCE } = require('../../shared/utils/common/constants');
const { Op } = require("sequelize");

const userRepo = new UserRepository();
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
    const duration = getTimeDifferenceInSeconds(userData.login_at, Date.now())

    if (userData?.role === USERS_ROLE.CALLCENTRE_AGENT) {
      const subLicenceData = await subUserLicenceRepo.findOne({ user_id: userData?.created_by });
      const agentData = await agentRepo.getByName(userData?.name)
      subLicenceData.available_licence.live_agent += 1;

      await subUserLicenceRepo.updateById(subLicenceData.id, { available_licence: subLicenceData.available_licence });
      await agentRepo.update(agentData.id, {
        login_status : "0"
      })
    }

    await userRepo.update(id, {
      duration
    })

    await userRepo.update(id, {
      login_at:null,
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
    console.log(error)
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
      for (const userId of userIds) {
        const deleteUser = await userRepo.getForLicence(userId);
        const loggedInUser = await userRepo.getForLicence(req.user.id);

        // if company admin is deleted
        if (deleteUser?.role === USERS_ROLE.COMPANY_ADMIN) {
          const mergedLicence = {};

          for (const key in deleteUser?.sub_user_licence?.available_licence) {
            mergedLicence[key] =
              (Number(deleteUser?.sub_user_licence?.available_licence[key]) || 0) +
              (Number(loggedInUser?.sub_user_licence?.available_licence[key]) || 0);
          }
          const companyLicence = await companyRepo.findOne({id: deleteUser?.company_id})
          const availableLicence = Number(companyLicence?.subUserLicenceId?.available_licence?.company);
          const updatedLicence = availableLicence + 1;
          await subUserLicenceRepo.updateById(companyLicence?.subUserLicenceId?.id, {available_licence: {company: updatedLicence}})

          if (req.user.role !== USERS_ROLE.RESELLER) {
            await subUserLicenceRepo.update(req.user.id, {available_licence: mergedLicence})
          }
          await subUserLicenceRepo.update(userId, {is_deleted: true})
        }
         // if Callcenter admin is deleted
        if (deleteUser?.role === USERS_ROLE.CALLCENTRE_ADMIN) {
          const mergedLicence = {};

          for (const key in deleteUser?.sub_user_licence?.available_licence) {
            mergedLicence[key] =
              (Number(deleteUser?.sub_user_licence?.available_licence[key]) || 0) +
              (Number(loggedInUser?.sub_user_licence?.available_licence[key]) || 0);
          }

          const callcenterLicence = await callCentreRepo.get(deleteUser?.callcenter_id)
          const availableLicence = Number(callcenterLicence?.subUserLicenceId?.available_licence?.callcenter);
          const updatedLicence = availableLicence + 1;
          await subUserLicenceRepo.updateById(callcenterLicence?.subUserLicenceId?.id, {available_licence: {callcenter: updatedLicence}})

          await subUserLicenceRepo.update(req.user.id, {available_licence: mergedLicence})
          await subUserLicenceRepo.update(userId, {is_deleted: true})
        }

        const availableLicence = loggedInUser?.sub_user_licence?.available_licence;

        let updatedData = { ...availableLicence };
        updatedData[deleteUser.role] = (updatedData[deleteUser.role] || 0) + 1;

        const mergedLicence = {};
        for (const key in deleteUser?.sub_user_licence?.available_licence) {
          mergedLicence[key] =
            (Number(deleteUser?.sub_user_licence?.available_licence[key]) || 0) +
            (Number(updatedData[key]) || 0);
        }

        if (loggedInUser?.sub_user_licence?.id) {
          await subUserLicenceRepo.updateById(loggedInUser?.sub_user_licence?.id, { available_licence: mergedLicence })
        }
        await subUserLicenceRepo.update(userId, {is_deleted: true})
      }
      await userRepo.deleteMany(userIds, req.user);
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
            const userLoginCount = await userRepo.getAll({
              where: {
                id: user.id,
                login_at: { [Op.ne]: null },
                logout_at: null
              }
            });
      
            if (userLoginCount && userLoginCount.length > 0) {
              ErrorResponse.message = 'User already logged in';
              return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }
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


async function signupUser(req, res) {
  const bodyReq = req.body;

  if (bodyReq?.user?.acl_settings) {
    bodyReq.user.acl_settings_id = bodyReq?.user?.acl_settings;
  }

  try {
    const existingUserData = await userRepo.findOne({
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
    let user;
    let subUserLicenceId;
    const loggedInData = await userRepo.getForLicence(req.user.id)
    console.log('loggedINdata', loggedInData)

    if (SUB_LICENCE_ROLE.includes(req.user.role)) {

      //fetch logged in user sub licence data(available_licence)
      const subLicenceData = loggedInData.sub_user_licence.available_licence

      // if available_licence are 0 then return
      if (Number(subLicenceData[bodyReq.user.role]) === 0) {
        ErrorResponse.message = 'Licence is not available';
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ErrorResponse);
      }
  
    }

    // when company user is created
    if (bodyReq.user.role === USERS_ROLE.COMPANY_ADMIN) {
      const companyLicence = await companyRepo.findOne({ id: bodyReq.user.company_id });

      const availableLicence = Number(companyLicence?.subUserLicenceId?.available_licence?.company);

      if (availableLicence === 0) {
        ErrorResponse.message = "Company's User Limit Exceeded. New User not added to company";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      } else {
        const updatedLicence = availableLicence - 1;

        await subUserLicenceRepo.updateById(
          companyLicence?.subUserLicenceId?.id,
          { available_licence: { company: updatedLicence } }
        );
      }
    }

    // when callcenter user is created
    if (bodyReq.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      const callCentreLicence = await callCentreRepo.get(bodyReq.user.callcenter_id);

      const availableLicence = Number(callCentreLicence?.subUserLicenceId?.available_licence?.callcenter);

      if (availableLicence === 0) {
        ErrorResponse.message = "Callcenter's User Limit Exceeded. New User not added to Callcenter";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      } else {
        const updatedLicence = availableLicence - 1;

        await subUserLicenceRepo.updateById(
          callCentreLicence?.subUserLicenceId?.id,
          { available_licence: { callcenter: updatedLicence } }
        );
      }
    }


    if (req.user.role === USERS_ROLE.COMPANY_ADMIN && bodyReq.user.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      const campanyAdmin = await userRepo.get(req.user.id)
      const prefix = Number(campanyAdmin.prefix) + PREFIX_VALUE

      bodyReq.user.prefix = prefix

      user = await userRepo.create(bodyReq.user);
      await userRepo.update(req.user.id, { prefix: prefix })
    } else {
      user = await userRepo.create(bodyReq.user);
    }


    if (req.user.role !== USERS_ROLE.SUPER_ADMIN && req.user.role !== USERS_ROLE.SUB_SUPERADMIN && bodyReq.user.role !== USERS_ROLE.RESELLER) {
      const data = await subUserLicenceRepo.create({
        user_id: user.id,
        total_licence: bodyReq.user.sub_licence,
        available_licence: bodyReq.user.sub_licence,
        created_by: req.user.id,
        ...(user.role === USERS_ROLE.COMPANY_ADMIN && { company_id: user?.company_id }),
        ...(user.role === USERS_ROLE.CALLCENTRE_ADMIN && { callcenter_id: user?.callcenter_id }),
      });
      subUserLicenceId = data.id
      await userRepo.update(user.id, { sub_user_licence_id: subUserLicenceId })

      if (loggedInData?.sub_user_licence?.id) {
        await subUserLicenceRepo.updateById(loggedInData.sub_user_licence.id, { available_licence: bodyReq.user.parent_licence })
      }
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
    console.log(error)
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
 
  try {
    const responseData = {};
    let userData;

    const existingUserData = await userRepo.findOne({
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

    const loggedInData = await userRepo.getForLicence(uid)

    // only update licence in case if reseller (reseller only update by superadmin or subsuperadmin)
    if (req.user.role === USERS_ROLE.SUPER_ADMIN || req.user.role === USERS_ROLE.SUB_SUPERADMIN || req.user.role === USERS_ROLE.RESELLER) {
      const isSame = areLicencesEqual(loggedInData?.sub_user_licence?.available_licence, bodyReq?.user?.sub_licence)
      if (req.user.role === USERS_ROLE.RESELLER && !isSame) {
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
      const isSame = areLicencesEqual(loggedInData?.sub_user_licence?.available_licence, bodyReq?.user?.sub_licence)
      if (!isSame) {
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

        await subUserLicenceRepo.update(uid,
          {
            available_licence: newAvailLicence,
            total_licence: bodyReq.user.sub_licence
        })
        await subUserLicenceRepo.update(req.user.id, {available_licence: bodyReq.user.parent_licence})
      }
    }
    
    //when user company is changes
    if ((Number(bodyReq?.user?.company_id) !== Number(loggedInData?.company_id)) && loggedInData.role === USERS_ROLE.COMPANY_ADMIN) {
      //get child for used licence of company user
      const child = await userRepo.getAll({
        where: {
          created_by: uid,
          role: USERS_ROLE.COMPANY_ADMIN
        }
      })
      const childIds = child.map(user => user.id);
      const usedLicence = child.length + 1;

      // get the available licence of new updated company
      const companyLicence = await companyRepo.findOne({ id: bodyReq?.user?.company_id });
      const availableLicence = Number(companyLicence?.subUserLicenceId?.available_licence?.company);

      if (availableLicence >= usedLicence) {
        //subtract from new company licence which is assign now
        const updatedLicence = availableLicence - usedLicence;

        await subUserLicenceRepo.updateById(
          companyLicence?.subUserLicenceId?.id,
          { available_licence: { company: updatedLicence } }
        );

        // Add licence to old company as this user is remove from this
        const oldCompanyLicence = await companyRepo.findOne({ id: loggedInData?.company_id });

        const oldAvailableLicence = Number(oldCompanyLicence?.subUserLicenceId?.available_licence?.company);
        const oldUpdatedLicence = oldAvailableLicence + usedLicence;

        await subUserLicenceRepo.updateById(
            oldCompanyLicence?.subUserLicenceId?.id,
            { available_licence: { company: oldUpdatedLicence } }
        );

        //update the company of childs also 
        await userRepo.bulkUpdate(childIds, {company_id: bodyReq?.user?.company_id})

      } else {
        ErrorResponse.message = "Can't Change Company because Used Licence are greater";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }

    //when user callcenter is changes
    if ((Number(bodyReq?.user?.callcenter_id) !== Number(loggedInData?.callcenter_id)) && loggedInData.role === USERS_ROLE.CALLCENTRE_ADMIN) {
      //get child for used licence of callcenter user
      const child = await userRepo.getAll({
        where: {
          created_by: uid,
          role: USERS_ROLE.CALLCENTRE_ADMIN
        }
      })
      const childIds = child.map(user => user.id);
      const usedLicence = child.length + 1;


      // get the available licence of new updated Callcenter
      const callcenterLicence = await callCentreRepo.get(bodyReq?.user?.callcenter_id);
      const availableLicence = Number(callcenterLicence?.subUserLicenceId?.available_licence?.callcenter);

      if (availableLicence >= usedLicence) {
        //subtract from new callcenter licence which is assign now
        const updatedLicence = availableLicence - usedLicence;

        await subUserLicenceRepo.updateById(
          callcenterLicence?.subUserLicenceId?.id,
          { available_licence: { callcenter: updatedLicence } }
        );

        // Add licence to old Callcenter as this user is remove from this
        const oldCallcenterLicence = await callCentreRepo.get(loggedInData?.callcenter_id);

        const oldAvailableLicence = Number(oldCallcenterLicence?.subUserLicenceId?.available_licence?.callcenter);
        const oldUpdatedLicence = oldAvailableLicence + usedLicence;

        await subUserLicenceRepo.updateById(
            oldCallcenterLicence?.subUserLicenceId?.id,
            { available_licence: { callcenter: oldUpdatedLicence } }
        );

        //update the Callcenter of childs also 
        if (childIds.length > 0) {
          await userRepo.bulkUpdate(childIds, {callcenter_id: bodyReq?.user?.callcenter_id})
        }

      } else {
        ErrorResponse.message = "Can't Change Callcenter because Used Licence are greater";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
    }

    const user = await userRepo.update(uid, bodyReq.user);
    // userData = await user.generateUserData();
    responseData.user = user


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
    console.log('error', error)
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

function getTimeDifferenceInSeconds(login, logout) {
  const loginTimestamp = Date.parse(login);
  const logoutTimestamp = logout;

  const diffMs = logoutTimestamp - loginTimestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  return diffSeconds;
}

function areLicencesEqual(userLicence, availableLicence) {
  for (const key in userLicence) {
    if (userLicence[key] !== availableLicence[key]) {
      return false;
    }
  }
  return true;
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