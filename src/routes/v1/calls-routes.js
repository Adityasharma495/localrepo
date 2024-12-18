const express = require("express");
const { CallsController } = require("../../controllers");
const { AuthMiddleware, TrunksMiddleware, CallsMiddleware } = require("../../middlewares");

const router = express.Router();

//calls create: /api/v1/calls POST
router.post('/', AuthMiddleware.validateUser, CallsMiddleware.validateCallsCreate, CallsMiddleware.modifyCallsCreateBodyRequest, CallsController.createCalls);

router.get("/", AuthMiddleware.validateUser, CallsController.getAll);

module.exports = router;
