const express = require("express");
const router = express.Router();
const {AuthMiddleware} = require("../../middlewares");
const {OperatorController} = require("../../c_controllers");

router.get("/", AuthMiddleware.validateUser, OperatorController.getAll);


module.exports = router;