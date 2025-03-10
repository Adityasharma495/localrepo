const express = require("express");
const { UserJourneyController } = require("../../c_controllers");
const { AuthMiddleware } = require("../../middlewares");

const router = express.Router();

//user journey getAll: /api/v2/user-journey GET
router.get("/", AuthMiddleware.validateUser, UserJourneyController.getAll);

module.exports = router;
