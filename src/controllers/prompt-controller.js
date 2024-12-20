const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessRespnose } = require("../utils/common");
const {PromptRepository} = require("../repositories")

const PromptRepo = new PromptRepository();

async function getPromptDetails(req, res) {
    try {
      // Extract `prompt_status` from query parameters
      const { prompt_status } = req.query;
  
      // Define query conditions based on the presence of `prompt_status`
      const conditions = prompt_status ? { prompt_status: parseInt(prompt_status) } : {};
  
      // Fetch prompts based on conditions
      const response = await PromptRepo.get(conditions);
  
      if (response && response.length > 0) {
        SuccessRespnose.data = response;
        SuccessRespnose.message = "Prompt fetched successfully";
        return res.status(StatusCodes.OK).json(SuccessRespnose);
      } else {
        // Handle no results
        SuccessRespnose.data = [];
        SuccessRespnose.message = "No prompts found";
        return res.status(StatusCodes.OK).json(SuccessRespnose);
      }
    } catch (error) {
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name === "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "Invalid prompt query";
      }
  
      ErrorResponse.message = errorMsg;
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }
  

async function updatePropmtStatus(req, res) {
    try {
      const { status } = req.body;
      const promptId = req.params.id;
  
      // Call the repository's update method
      const response = await PromptRepo.update(promptId, { prompt_status: status });
  
      // Check if the update was successful
      if (response) {
        SuccessRespnose.data = response; // The updated document or metadata from the repository
        SuccessRespnose.message = "Prompt status updated successfully";
        return res.status(StatusCodes.OK).json(SuccessRespnose);
      } else {
        // Handle case where no document is updated
        ErrorResponse.message = "Prompt not found or update failed";
        return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
      }
    } catch (error) {
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMsg = error.message;
  
      ErrorResponse.error = error;
      if (error.name === "CastError") {
        statusCode = StatusCodes.BAD_REQUEST;
        errorMsg = "Invalid Prompt ID";
      }
  
      ErrorResponse.message = errorMsg;
  
      return res.status(statusCode).json(ErrorResponse);
    }
  }
  
module.exports = {getPromptDetails,updatePropmtStatus}