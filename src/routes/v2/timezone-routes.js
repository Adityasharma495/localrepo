const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { UtilityController } = require("../../c_controllers");

const router = express.Router();

//Timezones get all: /api/v2/timezones GET
router.get("/", AuthMiddleware.validateUser, UtilityController.getAllTimezones);

module.exports = router;
