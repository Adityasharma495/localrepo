const { StatusCodes } = require('http-status-codes');
const { ErrorResponse, constants, Helpers, Authentication } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateIVRCreate(req,res,next){
    const bodyReq = req.body;

    // if(!req.is('application/json')){
    //     ErrorResponse.message = 'Something went wrong while ivr create';
    //     ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
    //     return res
    //             .status(StatusCodes.BAD_REQUEST)
    //             .json(ErrorResponse);

                
    // }

    // else if(bodyReq.data == undefined ){
    //     ErrorResponse.message = 'Something went wrong while ivr create';
    //     ErrorResponse.error = new AppError(['Data not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
    //     return res
    //             .status(StatusCodes.BAD_REQUEST)
    //             .json(ErrorResponse);
    // }
    // else if(bodyReq.name == undefined){
    //     ErrorResponse.message = 'Something went wrong while ivr create';
    //     ErrorResponse.error = new AppError(['Name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
    //     return res
    //             .status(StatusCodes.BAD_REQUEST)
    //             .json(ErrorResponse);
    // }
    // else if(bodyReq.menu_wait_time == undefined){
    //     ErrorResponse.message = 'Something went wrong while ivr create';
    //     ErrorResponse.error = new AppError(['menu_wait_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
    //     return res
    //             .status(StatusCodes.BAD_REQUEST)
    //             .json(ErrorResponse);
    // }
    // else if(bodyReq.reprompt == undefined){
    //     ErrorResponse.message = 'Something went wrong while ivr create';
    //     ErrorResponse.error = new AppError(['reprompt not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
    //     return res
    //             .status(StatusCodes.BAD_REQUEST)
    //             .json(ErrorResponse);
    // }
    // else if(bodyReq.input_action_data == undefined || !bodyReq.input_action_data){
    //     ErrorResponse.message = 'Something went wrong while ivr create';
    //     ErrorResponse.error = new AppError(['Input action data not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
    //     return res
    //             .status(StatusCodes.BAD_REQUEST)
    //             .json(ErrorResponse);
    // }
    // else if(bodyReq.config == undefined || !bodyReq.config){
    //     ErrorResponse.message = 'Something went wrong while ivr create';
    //     ErrorResponse.error = new AppError(['Config data not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
    //     return res
    //             .status(StatusCodes.BAD_REQUEST)
    //             .json(ErrorResponse);
    // }
    next();
}


function modifyIVRBodyRequest(req, is_create = true){
    
    try {
        const bodyReq = req.body;
        let inputData = {
            ivr: {
                input_action_data: bodyReq.input_action_data,
                config: bodyReq.config,
                name: bodyReq.name.trim(),
                menu_wait_time: bodyReq.menu_wait_time,
                reprompt: bodyReq.reprompt,
                call_centres: req.callcentre_id
            },
            ivr_data: bodyReq.data.trim()
        } 
        if(is_create) inputData.ivr.created_by = req.user.id
        return inputData;
    } catch (error) {
        throw error;
    }

}


function modifyIVRCreateBodyRequest(req,res,next){

    try {
        // const inputData = modifyIVRBodyRequest(req);
        // req.body = inputData;
        next();
    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating IVR';
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }

}



function modifyIVRUpdateBodyRequest(req,res,next){
    
    try {
        // const inputData = modifyIVRBodyRequest(req,false);
        // req.body = inputData;
        next();
    } catch (error) {
        ErrorResponse.message = 'Something went wrong while updating IVR';
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

function validateDeleteRequest(req, res, next) {
    const bodyReq = req.body;

  console.log('bodyReq')
    // Check if content type is JSON
    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting IVR';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    // Validate the presence and format of ivrIds
    if (!bodyReq.ivrIds || !Array.isArray(bodyReq.ivrIds) || bodyReq.ivrIds.length === 0) {
        ErrorResponse.message = 'Something went wrong while Deleting IVR';
        ErrorResponse.error = new AppError(['ivrIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    next();
}




module.exports = {
    validateIVRCreate,
    modifyIVRCreateBodyRequest,
    modifyIVRUpdateBodyRequest,
    validateDeleteRequest
}