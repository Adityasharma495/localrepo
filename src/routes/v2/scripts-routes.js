const express = require("express");
const router = express.Router();

const { AuthMiddleware } = require("../../middlewares");
const { ScriptsController } = require("../../c_controllers");

router.get("/", AuthMiddleware.validateUser, ScriptsController.getAll);

module.exports = router;
