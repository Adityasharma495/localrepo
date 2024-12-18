const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessRespnose } = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const {MemberScheduleRepository} = require("../repositories")


const memberScheduleRepo = new MemberScheduleRepository();

async function UpdateScheduleTime(req,res,next)
{
    const bodyReq = req.body;
    const group_id = req.params.id;

    try {
        const response = await memberScheduleRepo.memberUpdate(group_id,bodyReq)
        if(response)
        {
            SuccessRespnose.data= response;
            SuccessRespnose.message="Member Schedule Updated"
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
    
        return res.status(statusCode).json(ErrorResponse);

    }



    





}


module.exports = {UpdateScheduleTime}