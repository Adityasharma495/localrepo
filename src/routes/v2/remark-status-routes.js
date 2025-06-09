const express = require("express")
const router = express.Router();

const {AuthMiddleware, RemarkStatusMiddleware} = require("../../middlewares")
const {RemarkStatusController} = require("../../c_controllers")

router.get('/', AuthMiddleware.validateUser, RemarkStatusController.getAll)

// Delete Remark Status api/v2/remark-status/delete POST
router.post("/delete", AuthMiddleware.validateUser, RemarkStatusMiddleware.validateDeleteRequest, RemarkStatusController.deleteRemarkStatus);

// Create Remark Status api/v2/remark-status/create
router.post('/create', AuthMiddleware.validateUser, RemarkStatusMiddleware.validateRemarkStatusRequest, RemarkStatusMiddleware.modifyRemarkStatusCreateBodyRequest, RemarkStatusController.createRemarkStatus)

// get Remark Status by id api/v2/remark-status/:id
router.get('/:id', AuthMiddleware.validateUser, RemarkStatusController.get)

//Update Remark Status api/v2/remark-status/:id
router.post('/:id', AuthMiddleware.validateUser, RemarkStatusMiddleware.validateRemarkStatusRequest, RemarkStatusMiddleware.modifyRemarkStatusUpdateBodyRequest, RemarkStatusController.updateRemarkStatus)

module.exports = router;