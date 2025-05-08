const express = require('express');
const router = express.Router();
const { AuthMiddleware} = require('../../middlewares');
const {DidRemoveHistoryController} = require('../../c_controllers');

// get all DID Remove History api/v2/did-remove-history/
router.get('/', AuthMiddleware.validateUser, DidRemoveHistoryController.getAll)

module.exports = router;
