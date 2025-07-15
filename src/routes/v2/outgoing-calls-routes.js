const express = require("express");
const router = express.Router();
const { AuthMiddleware } = require("../../middlewares");
const { OutgoingCallsController } = require("../../c_controllers");

// get all outgoing calls api/v2/outgoing-calls/
router.get("/", AuthMiddleware.validateUser, OutgoingCallsController.getAll);
// router.get("/:agentId", AuthMiddleware.validateUser, OutgoingCallsController.getAll);

module.exports = router;
