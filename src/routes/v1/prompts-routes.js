const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { PromptController } = require("../../controllers");
const Router = express.Router();


Router.get('/',AuthMiddleware.validateUser,PromptController.getPromptDetails)
Router.post('/:id',AuthMiddleware.validateUser,PromptController.updatePropmtStatus)

module.exports =Router;