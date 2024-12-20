const { exec } = require('child_process');
const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessRespnose } = require("../utils/common");
const {PromptRepository, UserJourneyRepository} = require("../repositories")
const {MODULE_LABEL, ACTION_LABEL, BACKEND_API_BASE_URL, STORAGE_PATH, SERVER} = require('../utils/common/constants');
const { Logger } = require("../config");
const PromptRepo = new PromptRepository();
const fs = require("fs");
const userJourneyRepo = new UserJourneyRepository();

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

        const file_name = req.file.name;

        console.log('process.env.NODE_ENV', process.env.NODE_ENV)

        if (process.env.NODE_ENV === SERVER.PROD) {
            const fileAlias = file_name;
            const cmd = `bash -c "${STORAGE_PATH}scripts/checkFormat.sh ${req.user.id} ${fileAlias} ${fileAlias}"`;
    
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
    
            if (!duration || duration === '0') {
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


        

        const file_url = `${BACKEND_API_BASE_URL}/assets/voice/${req.user.id}/prompts/${file_name}`;

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
        console.log('errorerrorerrorerrorerror', error)
        const errorResponse = {
            message: 'Error while processing the Prompts file.',
            error: error
        };
        Logger.error('Prompts File processing error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}


module.exports = 
{
    getPromptDetails,
    savePrompts
}