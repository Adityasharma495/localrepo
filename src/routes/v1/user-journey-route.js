const express = require("express");
const { UserJourneyController } = require("../../controllers");
const { AuthMiddleware } = require("../../middlewares");

const router = express.Router();

//trunk getAll: /api/v1/trunks GET
router.get("/", AuthMiddleware.validateUser, UserJourneyController.getAll);

module.exports = router;
