const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { PromptController } = require("../../controllers");
const Router = express.Router();


Router.get('/',AuthMiddleware.validateUser,PromptController.getPromptDetails)

module.exports =Router;