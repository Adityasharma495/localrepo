const express = require("express");
const { CallsController } = require("../../c_controllers");
const { AuthMiddleware, TrunksMiddleware, CallsMiddleware } = require("../../middlewares");

const router = express.Router();

//calls create: /api/v2/calls POST
router.post('/', AuthMiddleware.validateUser, CallsMiddleware.validateCallsCreate, CallsMiddleware.modifyCallsCreateBodyRequest, CallsController.createCalls);

router.get("/", AuthMiddleware.validateUser, CallsController.getAll);

module.exports = router;
