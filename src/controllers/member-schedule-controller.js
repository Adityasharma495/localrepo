const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessRespnose } = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const {MemberScheduleRepository, AgentGroupRepository} = require("../repositories")
const { Logger } = require('../config');


const memberScheduleRepo = new MemberScheduleRepository();
const agentGroupRepo = new AgentGroupRepository();

async function UpdateScheduleTime(req,res,next)
{   
    const bodyReq = req.body;
    const group_id = req.params.id;

    try {
        const response = await memberScheduleRepo.memberUpdate(group_id,bodyReq)
        const responseGroup = await agentGroupRepo.bulkUpdate(group_id,{member_schedule_id:response._id})
        if(response && responseGroup)
        {
            SuccessRespnose.data= response;
            SuccessRespnose.message="Member Schedule Updated"
            Logger.info(`Member Schedule -> Updated successfully`);
            return res.status(StatusCodes.CREATED).json(SuccessRespnose);
        }
    } catch (error) {
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;

        ErrorResponse.error = error;
        if (error.name == "CastError") {
          statusCode = StatusCodes.BAD_REQUEST;
          errorMsg = "Member schedule error";
        }
        ErrorResponse.message = errorMsg;
        Logger.error(`Member Schedule -> error in updating member schedule ${JSON.stringify(error)}`);
        return res.status(statusCode).json(ErrorResponse);

    }
}


module.exports = {UpdateScheduleTime}