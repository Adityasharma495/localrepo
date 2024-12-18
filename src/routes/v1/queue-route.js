const express = require('express');
const router = express.Router();
const { AuthMiddleware, QueueMiddleware } = require('../../middlewares');
const {QueueController} = require('../../controllers');

// Delete queue api/v1/queue/delete POST
router.post("/delete", AuthMiddleware.validateUser, QueueMiddleware.validateDeleteRequest, QueueController.deleteQueue);

// Create queue api/v1/queue/
router.post('/', AuthMiddleware.validateUser, QueueMiddleware.validateQueueCreate, QueueMiddleware.modifyQueueCreateBodyRequest, QueueController.createQueue)

// get all queue api/v1/queue/
router.get('/', AuthMiddleware.validateUser, QueueController.getAll)

// get queue by id api/v1/queue/:id
router.get('/:id', AuthMiddleware.validateUser, QueueController.getById)

//Update queue api/v1/queue/:id
router.post('/:id', AuthMiddleware.validateUser, QueueMiddleware.validateQueueCreate, QueueMiddleware.modifyQueueUpdateBodyRequest, QueueController.updateQueue)


module.exports = router;