const express = require('express');
const router = express.Router();
const { AuthMiddleware, IncomingReportMiddleware } = require('../../middlewares');
const {IncomingReportController} = require('../../c_controllers');


// Delete incoming-report api/v2/incoming-report/
router.post("/delete", AuthMiddleware.validateUser, IncomingReportMiddleware.validateDeleteRequest, IncomingReportController.deleteIncomingReport);

// Create incoming-report api/v2/incoming-report/create
router.post('/create', AuthMiddleware.validateUser, IncomingReportMiddleware.validateIncomingReportRequest,
IncomingReportMiddleware.modifyIncomingReportCreateBodyRequest, IncomingReportController.createIncomingReport);

// get did-specific download-report api/v2/download-report/:did
router.get('/get-report/:did/:startDate/:endDate',AuthMiddleware.validateUser, IncomingReportController.getDidSpecificReport);

// get did-specific with trace_id
router.get('/get-report/:did/:startDate/:endDate/:trace_id',AuthMiddleware.validateUser, IncomingReportController.getDidSpecificReportwithTraceId);

// get all incoming-report api/v2/incoming-report/
router.get('/', AuthMiddleware.validateUser, IncomingReportController.getAll);

// get incoming-report by id api/v2/incoming-report/:id
router.get('/:id', AuthMiddleware.validateUser, IncomingReportController.getById);

//Update incoming-report api/v2/incoming-report/:id
router.post('/:id', AuthMiddleware.validateUser, IncomingReportMiddleware.validateIncomingReportRequest,
IncomingReportMiddleware.modifyIncomingReportUpdateBodyRequest, IncomingReportController.updateIncomingReport);

module.exports = router;