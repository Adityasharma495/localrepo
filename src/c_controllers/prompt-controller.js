const { exec } = require('child_process');
const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessRespnose } = require("../utils/common");
const { MODULE_LABEL, ACTION_LABEL, BACKEND_API_BASE_URL, STORAGE_PATH, SERVER } = require('../utils/common/constants');
const { Logger } = require("../config");
const fs = require("fs");
const {PromptRepository} = require('../c_repositories');
const {UserJourneyRepository} = require('../c_repositories');


const promptRepo = new PromptRepository();
const userJourneyRepo = new UserJourneyRepository();

async function getPromptDetails(req, res) {
    try {
        const { prompt_status, user_id } = req.query;
        const conditions = {};

        if (prompt_status) conditions.prompt_status = parseInt(prompt_status);
        if (user_id) conditions.createdBy = user_id;

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

        const options = {
            where: {
                created_by: req.user.id, 
                prompt_name: bodyReq.prompt_name
            }
        }

        const duplicates = await promptRepo.findOne(options);
        if (duplicates) {
            fs.unlinkSync(dest);
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'File Name Already Exists' });
        }

        const file_name = req.file.name;
        const file_url = `${BACKEND_API_BASE_URL}/temp/voice/${req.user.id}/prompts/${bodyReq.language}/${file_name}`;

        await promptRepo.create({
            prompt_category: bodyReq.prompt_category,
            prompt_name: bodyReq.prompt_name,
            prompt_url: file_url,
            createdBy: req.user.id,
            prompt_duration: bodyReq.duration || 0
        });

        await userJourneyRepo.create({
            module_name: MODULE_LABEL.PROMPTS,
            action: ACTION_LABEL.ADD,
            createdBy: req.user.id
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
            SuccessRespnose.message = "Prompt status updated successfully";
            return res.status(StatusCodes.OK).json(SuccessRespnose);
        } else {
            ErrorResponse.message = "Prompt not found or update failed";
            return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
        }
    } catch (error) {
        ErrorResponse.error = error;
        ErrorResponse.message = error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

module.exports = {
    getPromptDetails,
    savePrompts,
    updatePromptStatus
};
