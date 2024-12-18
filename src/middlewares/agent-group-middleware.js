const { StatusCodes } = require('http-status-codes');
const { AgentGroupRepository } = require("../repositories");
const { ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app-error');

const agentGroupRepo = new AgentGroupRepository();

function validateAgentGroupCreate(req, res, next) {


    
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Agent Group Create';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.group_name == undefined || !bodyReq.group_name.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['group_name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    // else if (bodyReq.agent_id == undefined || typeof bodyReq.agent_id !== 'object' || !bodyReq.agent_id.length > 0) {
    //     ErrorResponse.message = 'Something went wrong while agent Create';
    //     ErrorResponse.error = new AppError(['agent_id not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
    //     return res
    //         .status(StatusCodes.BAD_REQUEST)
    //         .json(ErrorResponse);
    // }

    else if (bodyReq.group_owner == undefined || !bodyReq.group_owner.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['group_owner not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.manager == undefined || !bodyReq.manager.trim()) {
        ErrorResponse.message = 'Something went wrong while agent Create';
        ErrorResponse.error = new AppError(['group_owner not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

// function modifyAgentGroupBodyRequest(req, is_create = true) {


//     try {

//         const uid  = req.params
//         const bodyReq = req.body;

//         let inputData


//         if (is_create) 
//             {
            
//                 inputData = {
//                     agent: {
//                         group_name: bodyReq.group_name.trim(),
//                         group_owner: bodyReq.group_owner.trim(),
//                         manager: bodyReq.manager.trim(),
//                         // agent_id: bodyReq.agent_id,
//                     }
//                 }


//                 inputData.agent.createdBy = req.user.id
//             }
                

//         if (!is_create) {

//             console.log("UPDTE BODY REQUEST", bodyReq);
//             inputData = {
//                 agent: {
//                     agent_id: bodyReq.agent_id || [], 
//                     time_schedule: bodyReq.time_schedule || [], 
//                     add_member_schedule: bodyReq.add_member_schedule || [],
//                     member_count: bodyReq.member_count || bodyReq.agent_id?.length || 0, 
//                     strategy: bodyReq.strategy || "ROUNDROBIN RINGING", // Default strategy
//                     answered: bodyReq.answered || 0, // Default value for answered calls
//                     missed: bodyReq.missed || 0, // Default value for missed calls
//                     sticky: bodyReq.sticky || false, // Default value for sticky
//                     is_deleted: bodyReq.is_deleted || false, // Default value for is_deleted
//                     createdBy: req.user?.id || bodyReq.createdBy, // User ID or provided createdBy
//                 },
//             };
            
            
//         }



        
//         return inputData;

//     } catch (error) {

//         throw error;

//     }

// }

async function modifyAgentGroupBodyRequest(req, is_create = true) {
    try {
        const bodyReq = req.body;
        let inputData;

        if (is_create) {
            inputData = {
                agent: {
                    group_name: bodyReq.group_name.trim(),
                    group_owner: bodyReq.group_owner.trim(),
                    manager: bodyReq.manager.trim(),
                },
            };
            inputData.agent.createdBy = req.user.id;
        }

        if (!is_create) {

            inputData = {
                agent: {
                    ...bodyReq,
                },
            };
        
        }
        return inputData;
    } catch (error) {
        throw error;
    }
}



async function modifyAgentGroupCreateBodyRequest(req, res, next) {


    try {
        const inputData = await modifyAgentGroupBodyRequest(req);
        req.body = inputData;

        console.log("INPUT DATA", inputData);
        next();

    } catch (error) {

        ErrorResponse.message = ' Group';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}


async function modifyAgentGroupUpdateBodyRequest(req, res, next) {

    try {
        const inputData = await modifyAgentGroupBodyRequest(req, false);
        req.body =inputData;

        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Agent Group';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Agent Group';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.agentGroupIds == undefined || typeof bodyReq.agentGroupIds !== 'object' || !bodyReq.agentGroupIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Agent Group';
        ErrorResponse.error = new AppError(['agentGroupIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}



module.exports = {
    validateAgentGroupCreate,
    modifyAgentGroupCreateBodyRequest,
    modifyAgentGroupUpdateBodyRequest,
    validateDeleteRequest
}