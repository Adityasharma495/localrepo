const express = require('express');
const router = express.Router();
const { AuthMiddleware, DownloadReportMiddleware } = require('../../middlewares');
const {DownloadReportController} = require('../../controllers');


// Create download-report api/v1/download-report/create
router.post('/', AuthMiddleware.validateUser, DownloadReportMiddleware.validateCreateRequest,
DownloadReportController.createDownloadReport);

// get all download-report api/v1/download-report/
router.get('/', AuthMiddleware.validateUser, DownloadReportController.getAll);


module.exports = router;