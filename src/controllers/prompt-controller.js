const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessRespnose } = require("../utils/common");
const {PromptRepository} = require("../repositories")

const PromptRepo = new PromptRepository();

async function getPromptDetails(req,res)
{
    try {
        const response = await PromptRepo.get()
        if(response)
        {
            SuccessRespnose.data= response;
            SuccessRespnose.message="Prompt fetched successfully"
            return res.status(StatusCodes.CREATED).json(SuccessRespnose);
        }
    } catch (error) {
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        let errorMsg = error.message;
    
        ErrorResponse.error = error;
        if (error.name == "CastError") {
          statusCode = StatusCodes.BAD_REQUEST;
          errorMsg = "Prompt error";
        }
        ErrorResponse.message = errorMsg;
    
        return res.status(statusCode).json(ErrorResponse);

    }
}


module.exports = {getPromptDetails}