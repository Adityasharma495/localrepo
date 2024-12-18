const { StatusCodes } = require("http-status-codes");
const { ErrorResponse } = require("../utils/common");
const AppError = require("../utils/errors/app-error");


async function validateSchedule(req,res,next)
{
    const bodyReq = req.body
    const group_id = req.params.id


    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while scheduling time';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.start_time == undefined || !bodyReq.start_time.trim()) {
        ErrorResponse.message = 'Something went wrong while scheduling time';
        ErrorResponse.error = new AppError(['start_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.end_time == undefined || !bodyReq.end_time.trim()) {
        ErrorResponse.message = 'Something went wrong while scheduling time';
        ErrorResponse.error = new AppError(['end_time not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (group_id == undefined || !group_id.trim()) {
        ErrorResponse.message = 'Something went wrong while scheduling time';
        ErrorResponse.error = new AppError(['group_id not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.week_days == undefined) {
        ErrorResponse.message = 'Something went wrong while scheduling time';
        ErrorResponse.error = new AppError(['week_days not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }


    next();
}

module.exports={validateSchedule}