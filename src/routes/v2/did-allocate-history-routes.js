const express = require('express');
const router = express.Router();
const { AuthMiddleware} = require('../../middlewares');
const {DidAllocateHistoryController} = require('../../c_controllers');

// get all DID Allocate History api/v2/did-allocate-history/
router.get('/', AuthMiddleware.validateUser, DidAllocateHistoryController.getAll)

module.exports = router;
