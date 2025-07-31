const { exec } = require("child_process");
const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessRespnose, constants } = require("../../shared/utils/common");
const { MODULE_LABEL, ACTION_LABEL, BACKEND_API_BASE_URL, STORAGE_PATH, SERVER, USERS_ROLE } = require('../../shared/utils/common/constants');
const { Logger } = require("../../shared/config");
const fs = require("fs");
const {PromptRepository, UserRepository, FlowJsonRepository} = require('../../shared/c_repositories');
const {UserJourneyRepository} = require('../../shared/c_repositories');
const promptRepo = new PromptRepository();
const userJourneyRepo = new UserJourneyRepository();
const userRepo = new UserRepository();
const flowJsonRepo = new FlowJsonRepository();

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
                SuccessRespnose.data = Prompts;
                SuccessRespnose.message = "Prompt fetched successfully";
                return res.status(StatusCodes.OK).json(SuccessRespnose);
            } else {
                SuccessRespnose.data = [];
                SuccessRespnose.message = "No prompts found";
                return res.status(StatusCodes.OK).json(SuccessRespnose);
            }
        }
        if(req.user.role === USERS_ROLE.CALLCENTRE_ADMIN)
        {
            conditions.is_deleted=false
        }

        // 👇 fallback for superadmin or others
        if (prompt_status) conditions.prompt_status = parseInt(prompt_status);
        if (user_id) conditions.created_by = user_id;

        const results = await promptRepo.get(conditions);

        if (results.length > 0) {
            SuccessRespnose.data = results;
            SuccessRespnose.message = "Prompt fetched successfully";
            return res.status(StatusCodes.OK).json(SuccessRespnose);
        } else {
            SuccessRespnose.data = [];
            SuccessRespnose.message = "No prompts found";
            return res.status(StatusCodes.OK).json(SuccessRespnose);
        }
    } catch (error) {
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

        const file_name = bodyReq.prompt_name;
        const file_url = `${BACKEND_API_BASE_URL}/temp/voice/${req.user.id}/prompts/${bodyReq.language}/${req.fileAlias}`;
        const fileAlias = req.fileAlias
        if (process.env.NODE_ENV === SERVER.PROD) {
            const cmd = `bash -c "${STORAGE_PATH}script/checkFormat.sh ${req.user.id} ${file_name} ${fileAlias} ${bodyReq.language}"`;
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

        const new_file_url = `${BACKEND_API_BASE_URL}/assets/voice/${req.user.id}/prompts/${bodyReq.language}/${req.fileAlias}`;

        await promptRepo.create({
            prompt_category: bodyReq.prompt_category,
            prompt_name: bodyReq.prompt_name,
            prompt_url: new_file_url,
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

async function getAllPrompt(req, res) {
    try {
        let results;
        if (req?.user?.role === constants.USERS_ROLE.SUPER_ADMIN) {
            results = await promptRepo.get({is_deleted: false});
        }
        else {
            results = await promptRepo.get({created_by: req.user.id, is_deleted: false});
        }
        if (results.length > 0) {
            SuccessRespnose.data = results;
            SuccessRespnose.message = "Prompt fetched successfully";
            return res.status(StatusCodes.OK).json(SuccessRespnose);
        } else {
            SuccessRespnose.data = [];
            SuccessRespnose.message = "No prompts found";
            return res.status(StatusCodes.OK).json(SuccessRespnose);
        }
    } catch (error) {
        ErrorResponse.error = error;
        ErrorResponse.message = error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function deletePrompt(req, res) {
  const idArray = req.body.promptIds;

  try {
    let deletedPrompt = await promptRepo.getAll({id : idArray});
    const { allocatedIds, unallocatedIds } = deletedPrompt.reduce(
    (acc, item) => {
        if (item.is_allocated === '1') {
        acc.allocatedIds.push(item.id);
        } else if (item.is_allocated === '0') {
        acc.unallocatedIds.push(item.id);
        }
        return acc;
    },
    { allocatedIds: [], unallocatedIds: [] }
    );

    await promptRepo.deleteMany(unallocatedIds, req.user.id);

    const userJourneyfields = {
      module_name: MODULE_LABEL.DATA_CENTER,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);

    let message
    if (allocatedIds.length === 0) {
        message = "All selected audios have been deleted successfully.";
    } else {
        message = `${allocatedIds.length} audio file(s) could not be deleted because they are used in existing IVR flows.` +
        (unallocatedIds.length > 0 ? ` ${unallocatedIds.length} audio file(s) were deleted successfully.` : '');
    }

    SuccessRespnose.data = message;

    Logger.info(`Prompt -> ${unallocatedIds} deleted successfully and ${allocatedIds.length} audio file(s) could not be deleted because they are used in existing IVR flows.`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    var statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    var errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "Prompt not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `Prompt -> unable to delete Prompt: ${idArray}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
    getPromptDetails,
    savePrompts,
    updatePromptStatus,
    getAllPrompt,
    deletePrompt
};
