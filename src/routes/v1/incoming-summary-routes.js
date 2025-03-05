const express = require('express');
const router = express.Router();
const { AuthMiddleware } = require('../../middlewares');
const {IncomingSummaryController} = require('../../controllers');

// get all acl settings api/v1/incoming-summary/
router.get('/', AuthMiddleware.validateUser, IncomingSummaryController.getAll)


module.exports = router;