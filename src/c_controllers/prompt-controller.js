const { exec } = require("child_process");
const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessRespnose, ResponseFormatter } = require("../utils/common");
const { MODULE_LABEL, ACTION_LABEL, BACKEND_API_BASE_URL, STORAGE_PATH, SERVER, USERS_ROLE } = require('../utils/common/constants');
const { Logger } = require("../config");
const fs = require("fs");
const {PromptRepository, UserRepository} = require('../c_repositories');
const {UserJourneyRepository} = require('../c_repositories');


const promptRepo = new PromptRepository();
const userJourneyRepo = new UserJourneyRepository();
const userRepo = new UserRepository();
const version = process.env.API_V || '1';

async function getPromptDetails(req, res) {
    try {
        const { prompt_status, user_id } = req.query;
        const conditions = {};

        // This block only applies for COMPANY_ADMIN or RESELLER (parent types)
        if (req.user.role === USERS_ROLE.COMPANY_ADMIN || req.user.role === USERS_ROLE.RESELLER) {
            const parentId = req.user.id;
            const results = await promptRepo.get(conditions);

            const Prompts = [];

            for (const result of results) {
                let currentUserId = result.created_by;  

                
                let found = false;

                while (currentUserId) {
                    const parentUser = await userRepo.findParent({ id: currentUserId });

                    if (!parentUser) {
                        break;
                    }

                    if (parentUser.id === parentId) {
                        
                        Prompts.push(result);
                        found = true;
                        break; 
                    }
                    currentUserId = parentUser.created_by;
                }
            }

            if (Prompts.length > 0) {
                SuccessRespnose.data = ResponseFormatter.formatResponseIds(Prompts, version);
                SuccessRespnose.message = "Prompt fetched successfully";
                return res.status(StatusCodes.OK).json(SuccessRespnose);
            } else {
                SuccessRespnose.data = [];
                SuccessRespnose.message = "No prompts found";
                return res.status(StatusCodes.OK).json(SuccessRespnose);
            }
        }

        // 👇 fallback for superadmin or others
        if (prompt_status) conditions.prompt_status = parseInt(prompt_status);
        if (user_id) conditions.created_by = user_id;

        const results = await promptRepo.get(conditions);

        if (results.length > 0) {
            SuccessRespnose.data = ResponseFormatter.formatResponseIds(results, version);
            SuccessRespnose.message = "Prompt fetched successfully";
            return res.status(StatusCodes.OK).json(SuccessRespnose);
        } else {
            SuccessRespnose.data = [];
            SuccessRespnose.message = "No prompts found";
            return res.status(StatusCodes.OK).json(SuccessRespnose);
        }
    } catch (error) {
        console.log("error ", error);
        ErrorResponse.error = error;
        ErrorResponse.message = error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}


async function savePrompts(req, res) {
    const dest = req.file.path;
    const bodyReq = { ...req.body };
    try {
        if (!fs.existsSync(dest)) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'File not found' });
        }

        const duplicates = await promptRepo.findOne({
            created_by: req.user.id, 
            prompt_name: bodyReq.prompt_name
        });

        if (duplicates) {
            fs.unlinkSync(dest);
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'File Name Already Exists' });
        }

        const file_name = req.file.name;
        const file_url = `${BACKEND_API_BASE_URL}/temp/voice/${req.user.id}/prompts/${bodyReq.language}/${file_name}`;

        const fileAlias = req.fileAlias
        if (process.env.NODE_ENV === SERVER.PROD) {
            const cmd = `bash -c "${STORAGE_PATH}scripts/checkFormat.sh ${req.user.id} ${file_name} ${fileAlias} ${bodyReq.language}"`;
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

        await promptRepo.create({
            prompt_category: bodyReq.prompt_category,
            prompt_name: bodyReq.prompt_name,
            prompt_url: file_url,
            created_by: req.user.id,
            prompt_duration: bodyReq.duration || 0
        });

        await userJourneyRepo.create({
            module_name: MODULE_LABEL.PROMPTS,
            action: ACTION_LABEL.ADD,
            created_by: req.user.id
        });

        SuccessRespnose.message = "Successfully created a new Prompt";
        return res.status(StatusCodes.CREATED).json(SuccessRespnose);
    } catch (error) {
        console.log("error", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error while processing the Prompts file.', error });
    }
}

async function updatePromptStatus(req, res) {
    try {
        const { status } = req.body;
        const promptId = req.params.id;

        const result = await promptRepo.update(promptId, { prompt_status: status });

        if (result) {
            return res.status(StatusCodes.OK).json({
                message: "Prompt status updated successfully",
            });
        } else {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Prompt not found or update failed",
            });
        }
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = {
    getPromptDetails,
    savePrompts,
    updatePromptStatus
};
