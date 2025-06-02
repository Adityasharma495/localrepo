const express = require("express");
const { AuthMiddleware, PromptsMiddleware } = require("../../middlewares");
const { PromptController } = require("../../c_controllers");
const Router = express.Router();

// Delete data center api/v2/prompts/delete
Router.post("/delete", AuthMiddleware.validateUser, PromptsMiddleware.validateDeleteRequest, PromptController.deletePrompt);

//get prompts
Router.get('/',AuthMiddleware.validateUser,PromptController.getPromptDetails)

//Update Routes
Router.post('/:id',AuthMiddleware.validateUser,PromptController.updatePromptStatus)

// save/add prompts
Router.post('/',AuthMiddleware.validateUser, PromptsMiddleware.upload,PromptsMiddleware.validateCreatePrompts,
    PromptsMiddleware.saveFile,PromptController.savePrompts);

//get prompts
Router.get('/all',AuthMiddleware.validateUser,PromptController.getAllPrompt)

module.exports =Router;