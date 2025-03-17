const express = require("express");
const { AuthMiddleware, PromptsMiddleware } = require("../../middlewares");
const { PromptController } = require("../../c_controllers");
const Router = express.Router();

//get prompts
Router.get('/',AuthMiddleware.validateUser,PromptController.getPromptDetails)

//Update Routes
Router.post('/:id',AuthMiddleware.validateUser,PromptController.updatePromptStatus)

// save/add prompts
Router.post('/',AuthMiddleware.validateUser, PromptsMiddleware.upload,PromptsMiddleware.validateCreatePrompts,
    PromptsMiddleware.saveFile,PromptController.savePrompts);

module.exports =Router;