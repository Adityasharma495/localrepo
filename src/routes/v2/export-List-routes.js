const express = require('express');
const router = express.Router();
const {ExportListController} = require('../../c_controllers');
const {AuthMiddleware} = require('../../middlewares');

// get export list by id api/v2/export/:model
router.get('/:model', AuthMiddleware.validateUser, ExportListController.exportData)


module.exports = router;