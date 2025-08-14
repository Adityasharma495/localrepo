const express = require("express");
const router = express.Router();
const { AuthMiddleware } = require("../../middlewares");
const { IncomingSummaryController } = require("../../c_controllers");

// get all incoming summary api/v2/incoming-summary/
router.get("/", AuthMiddleware.validateUser, IncomingSummaryController.getAll);
router.get("/date-range", AuthMiddleware.validateUser, IncomingSummaryController.getByDateRange);

module.exports = router;
