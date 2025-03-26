const express = require('express');
const router = express.Router();
const { AuthMiddleware, IncomingReportMiddleware } = require('../../middlewares');
const {IncomingReportController} = require('../../controllers');


// Delete incoming-report api/v1/incoming-report/
router.post("/delete", AuthMiddleware.validateUser, IncomingReportMiddleware.validateDeleteRequest, IncomingReportController.deleteIncomingReport);

// Create incoming-report api/v1/incoming-report/create
router.post('/create', AuthMiddleware.validateUser, IncomingReportMiddleware.validateIncomingReportRequest,
IncomingReportMiddleware.modifyIncomingReportCreateBodyRequest, IncomingReportController.createIncomingReport);

// get all incoming-report api/v1/incoming-report/
router.get('/', AuthMiddleware.validateUser, IncomingReportController.getAll);

// get incoming-report by id api/v1/incoming-report/:id
router.get('/:id', AuthMiddleware.validateUser, IncomingReportController.getById);

//Update incoming-report api/v1/incoming-report/:id
router.post('/:id', AuthMiddleware.validateUser, IncomingReportMiddleware.validateIncomingReportRequest,
IncomingReportMiddleware.modifyIncomingReportUpdateBodyRequest, IncomingReportController.updateIncomingReport);

module.exports = router;