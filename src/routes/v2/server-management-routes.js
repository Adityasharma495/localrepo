const express = require('express');
const router = express.Router();
const { AuthMiddleware, ServerManagementMiddleware } = require('../../middlewares');
const {ServerManagementController} = require('../../c_controllers');

// Delete server api/v2/server-management/delete
router.post("/delete", AuthMiddleware.validateUser, ServerManagementMiddleware.validateDeleteRequest, ServerManagementController.deleteServerManagement);

// Create server api/v2/server-management/create
router.post('/create', AuthMiddleware.validateUser, ServerManagementMiddleware.validateServerManagementRequest,
ServerManagementMiddleware.modifyServerManagementCreateBodyRequest, ServerManagementController.createServerManagement);

// get all server api/v2/server-management/
router.get('/', AuthMiddleware.validateUser, ServerManagementController.getAll);

// get server by id api/v2/server-management/:id
router.get('/:id', AuthMiddleware.validateUser, ServerManagementController.getById);

//Update server api/v2/server-management/:id
router.post('/:id', AuthMiddleware.validateUser, ServerManagementMiddleware.validateServerManagementRequest,
ServerManagementMiddleware.modifyServerManagementUpdateBodyRequest, ServerManagementController.updateServerManagement);

module.exports = router;