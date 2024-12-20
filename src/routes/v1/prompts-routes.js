const express = require("express");
const { AuthMiddleware, PromptsMiddleware } = require("../../middlewares");
const { PromptController } = require("../../controllers");
const Router = express.Router();

//get prompts
Router.get('/',AuthMiddleware.validateUser,PromptController.getPromptDetails)
Router.post('/:id',AuthMiddleware.validateUser,PromptController.updatePropmtStatus)

// save/add prompts
Router.post('/',AuthMiddleware.validateUser, PromptsMiddleware.upload,PromptsMiddleware.validateCreatePrompts,
    PromptsMiddleware.saveFile,PromptController.savePrompts);

module.exports =Router;