const { exec } = require('child_process');
const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessRespnose } = require("../utils/common");
const {PromptRepository, UserJourneyRepository} = require("../repositories")
const {MODULE_LABEL, ACTION_LABEL, BACKEND_API_BASE_URL, STORAGE_PATH, SERVER} = require('../utils/common/constants');
const { Logger } = require("../config");
const PromptRepo = new PromptRepository();
const fs = require("fs");
const userJourneyRepo = new UserJourneyRepository();

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
  

async function savePrompts(req, res) {
    const dest = req.file.path;
    const bodyReq = Object.assign({}, req.body);
    try {
        const responseData = {};
        if (!fs.existsSync(dest)) {
            const errorResponse = {
                message: 'File not foundd',
                error: new Error('File not found')
            };
            Logger.error('File processing error:', errorResponse.error);
            return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
        }

        // check for duplicate file name
        const conditions = {
            createdBy: req.user.id, 
            prompt_name: bodyReq.prompt_name 
        }
        const checkDuplicate = await PromptRepo.findOne(conditions);
                
        if (checkDuplicate && Object.keys(checkDuplicate).length !== 0) {
            try {
                fs.unlinkSync(dest);
            } catch (unlinkError) {
                Logger.error(`Failed to delete file at ${dest}: ${unlinkError.message}`);
                const errorResponse = {
                    message: 'File Name Already Exists and failed to delete uploaded file',
                    error: new Error('Duplicate File Issue'),
                };
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
            }

            ErrorResponse.message = `File Name Already Exists`;
                return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }

        const file_name = req.file.name;
        const fileAlias = req.fileAlias

        if (process.env.NODE_ENV === SERVER.PROD) {
            const cmd = `bash -c "${STORAGE_PATH}scripts/checkFormat.sh ${req.user.id} ${file_name} ${fileAlias}"`;
            Logger.info(`Executing script: ${cmd}`);
    
            const duration = await new Promise((resolve, reject) => {
                exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        Logger.error(`Script execution error: ${error.message}`);
                        return reject(new Error('Failed to execute duration script'));
                    }
                    if (stderr) {
                        Logger.error(`Script stderr: ${stderr}`);
                    }
                    Logger.info(`Script stdout: ${stdout}`);
                    resolve(stdout.trim());
                });
            });

    
            if (!duration || duration === '0'|| duration === 0) {
                const errorResponse = {
                    message: 'Invalid or zero duration of Uploaded File',
                    error: new Error('File Duration Issue')
                };
                Logger.error('File Duration error:', errorResponse.error);
                return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
            } else {
                bodyReq.duration = duration
            }
        }


        

        const file_url = `${BACKEND_API_BASE_URL}/temp/voice/${req.user.id}/prompts/${file_name}`;

        const prompts = await PromptRepo.create({
            prompt_category: bodyReq.prompt_category,
            prompt_name: bodyReq.prompt_name,
            prompt_url: file_url,
            createdBy: req.user.id,
            prompt_duration : bodyReq.duration || 0
        });

        responseData.prompts = prompts;

        const userJourneyfields = {
          module_name: MODULE_LABEL.PROMPTS,
          action: ACTION_LABEL.ADD,
          createdBy:  req?.user?.id
        }
    
        const userJourney = await userJourneyRepo.create(userJourneyfields);
        responseData.userJourney = userJourney
    
        SuccessRespnose.data = responseData;
        SuccessRespnose.message = "Successfully created a new Prompts";
    
        Logger.info(
          `Prompts -> created successfully: ${JSON.stringify(responseData)}`
        );
    
        return res.status(StatusCodes.CREATED).json(SuccessRespnose);

    } catch (error) {
        const errorResponse = {
            message: 'Error while processing the Prompts file.',
            error: error
        };
        Logger.error('Prompts File processing error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
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


module.exports = 
{
    getPromptDetails,
    savePrompts,
    updatePropmtStatus
}

  
