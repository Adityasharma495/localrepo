const { StatusCodes } = require('http-status-codes');
const { ErrorResponse, constants, Helpers, Authentication } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function    validateSignup(req, res, next){

    const bodyReq = req.body;
    const createrRole = req['user'].role
    const userRole = bodyReq.role;


   
    const permission = Authentication.checkPermission(createrRole,userRole);



    if(!req.is('application/json')){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.username == undefined || !bodyReq.username.trim()){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError(['Username not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.name == undefined || !bodyReq.name.trim()){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError(['Name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.email == undefined || !bodyReq.email.trim()){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError(['Email not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.password == undefined || !bodyReq.password.trim()){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError(['Password not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    //Validation min password characters because it wouldn't work in mongoose schema (because that will receive hash password)
    else if(bodyReq.password.length < constants.VALIDATIONS.MIN_PASSWORD_LENGTH){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError([`Password must be of minimum ${constants.VALIDATIONS.MIN_PASSWORD_LENGTH} characters in the incoming request in the correct form`], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);           
    }
    else if(bodyReq.role == undefined || !bodyReq.role.trim()){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError(['Role not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);    
                    
    } 
    
    if (bodyReq?.acl_settings) {
        if (bodyReq.acl_settings == undefined || !bodyReq.acl_settings.trim()) {
            ErrorResponse.message = 'Something went wrong while while user signup';
            ErrorResponse.error = new AppError(['acl_settings not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }

    if(!permission){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError([`${createrRole} unable to create ${userRole}`], StatusCodes.UNAUTHORIZED);
        return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(ErrorResponse)
    }
    const ifValidateCompany = Authentication.ifAssociateCompany(bodyReq.role);


    if(ifValidateCompany){

        if(bodyReq.company == undefined){
            ErrorResponse.message = 'Something went wrong while user signup';
            ErrorResponse.error = new AppError(['Company not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json(ErrorResponse);   
        }
    }

    if (bodyReq.role === constants.USERS_ROLE.CALLCENTRE_ADMIN) {
        if(bodyReq.callcenterId == undefined){
            ErrorResponse.message = 'Something went wrong while user signup';
            ErrorResponse.error = new AppError(['Callcenter Id not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json(ErrorResponse);   
        }
    }

    next();

}

function validateSignin(req, res, next){
    
    const bodyReq = req.body;

    if(!req.is('application/json')){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.username == undefined || !bodyReq.username.trim()){
        ErrorResponse.message = 'Something went wrong while user signin';
        ErrorResponse.error = new AppError(['Username not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.password == undefined || !bodyReq.password.trim()){
        ErrorResponse.message = 'Something went wrong while user signin';
        ErrorResponse.error = new AppError(['Password not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }

    next();

}


function validateUpdateUser(req, res, next){

    const bodyReq = req.body;

    if(!req.is('application/json')){
        ErrorResponse.message = 'Something went wrong while updating user';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.username == undefined || !bodyReq.username.trim()){
        ErrorResponse.message = 'Something went wrong while updating user';
        ErrorResponse.error = new AppError(['Username not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.status == undefined || isNaN(bodyReq.status) ){
        ErrorResponse.message = 'Something went wrong while updating user';
        ErrorResponse.error = new AppError(['Status not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.password != undefined && !bodyReq.password.trim()){
        ErrorResponse.message = 'Something went wrong while updating user';
        ErrorResponse.error = new AppError(['Password not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    //Validation min password characters because it wouldn't work in mongoose schema (because that will receive hash password)
    else if(bodyReq.password != undefined && bodyReq.password.length < constants.VALIDATIONS.MIN_PASSWORD_LENGTH){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError([`Password must be of minimum ${constants.VALIDATIONS.MIN_PASSWORD_LENGTH} characters in the incoming request in the correct form`], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);           
    }
    else if(bodyReq.name == undefined || !bodyReq.name.trim()){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError(['Name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    else if(bodyReq.email == undefined || !bodyReq.email.trim()){
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = new AppError(['Email not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }

    if (bodyReq?.acl_settings) {
        if (bodyReq.acl_settings == undefined || !bodyReq.acl_settings.trim()) {
            ErrorResponse.message = 'Something went wrong while while user signup';
            ErrorResponse.error = new AppError(['acl_settings not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }

    if(bodyReq.company){

        if(bodyReq.company == undefined){
            ErrorResponse.message = 'Something went wrong while user signup';
            ErrorResponse.error = new AppError(['Company not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json(ErrorResponse);      
        }

    }

    next();

}


/**
 * Modify input body request for signup according if there is associated company data or not
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {boolean} is_create: If for create user or update user
 * @returns 
 */
function modifyUserSignupBodyRequest(req, res, next, is_create){

    try {
     
        const bodyReq = req.body;
        
        let inputData = {
            user: {
                username: bodyReq.username.trim(),
                name: bodyReq.name.trim(),
                email: bodyReq.email.trim(),
                module: bodyReq.module,
                company:bodyReq.company,
                acl_settings: bodyReq.acl_settings,
                // licence: bodyReq?.licence || 0,
                sub_licence: bodyReq?.sub_licence || {},
                flow_type: bodyReq?.flow_type,
                parent_licence: bodyReq?.parent_licence || {},
            }
        };

        //In case of user create
        if(is_create){
            inputData.user.role = bodyReq.role;
            inputData.user.password = bodyReq.password.trim();
            inputData.user.created_by =  bodyReq.created_by ?? req.user.id;
        }
        //In case of user update
        else{
            inputData.user.status = Number(bodyReq.status);
        }

        let ifValidateCompany
        if (is_create) {
            ifValidateCompany = Authentication.ifAssociateCompany(bodyReq.role);
        } else {
            ifValidateCompany = Authentication.ifAssociateCompany(bodyReq.role);
        }

        //If company is to be associated with the user, then append company user details
        if(ifValidateCompany){

            inputData.company = bodyReq.company
        }

        if (bodyReq.role === constants.USERS_ROLE.CALLCENTRE_ADMIN) {
            inputData.callcenterId = bodyReq.callcenterId
        }
    
        req.body = inputData;
    
        next();        

    } catch (error) {
      
        ErrorResponse.message = 'Something went wrong while user signup';
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse); 

    }

}

// Middleware to authenticate superadmin
const authenticateSuperAdmin = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = await Authentication.verifyJWToken(token);
    
    // if ((decoded.role !== 'role_sadmin') && (decoded.role !== 'role_reseller')) {
    //   return res.status(403).json({ error: 'Access denied. Insufficient privileges.' });
    // }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting User';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.userIds == undefined || typeof bodyReq.userIds !== 'object' || !bodyReq.userIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting User';
        ErrorResponse.error = new AppError(['userIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

function validateUserStatusRequest (req, res, next) {
    const bodyReq = req.body;

    

    if(!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while updating user data';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (!bodyReq.hasOwnProperty('status') && !bodyReq.hasOwnProperty('newPassword')) {
        ErrorResponse.message = 'Something went wrong while updating user status / password';
        ErrorResponse.error = new AppError(['status / password not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateSignup,
    validateSignin,
    validateUpdateUser,
    modifyUserSignupBodyRequest,
    authenticateSuperAdmin,
    validateDeleteRequest,
    validateUserStatusRequest
}