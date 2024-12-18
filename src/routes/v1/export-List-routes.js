const express = require('express');
const router = express.Router();
const {ExportListController} = require('../../controllers');
const {AuthMiddleware} = require('../../middlewares');

// get acl settings by id api/v1/acl-settings/:id
router.get('/:model', AuthMiddleware.validateUser, ExportListController.exportData)


module.exports = router;