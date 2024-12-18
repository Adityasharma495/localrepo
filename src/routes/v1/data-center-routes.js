const express = require('express');
const router = express.Router();
const { AuthMiddleware, DataCenterMiddleware } = require('../../middlewares');
const {DataCenterController} = require('../../controllers');

// Delete data center api/v1/data-center/
router.post("/delete", AuthMiddleware.validateUser, DataCenterMiddleware.validateDeleteRequest, DataCenterController.deleteDataCenter);

// Create data center api/v1/data-center/create
router.post('/create', AuthMiddleware.validateUser, DataCenterMiddleware.validateDataCenterRequest, DataCenterMiddleware.modifyDataCenterCreateBodyRequest, DataCenterController.createDataCenter)

// get all data center api/v1/data-center/
router.get('/', AuthMiddleware.validateUser, DataCenterController.getAll)

// get data center by id api/v1/data-center/:id
router.get('/:id', AuthMiddleware.validateUser, DataCenterController.getById)

//Update data center api/v1/data-center/:id
router.post('/:id', AuthMiddleware.validateUser, DataCenterMiddleware.validateDataCenterRequest, DataCenterMiddleware.modifyDataCenterUpdateBodyRequest, DataCenterController.updateDataCenter)

module.exports = router;