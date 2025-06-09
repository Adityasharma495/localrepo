const express = require("express")
const router = express.Router();

const {AuthMiddleware} = require("../../middlewares")
const {RemarksController} = require("../../c_controllers")

router.get('/', AuthMiddleware.validateUser, RemarksController.getAll)

// Create Remarks api/v2/remarks/create
router.post('/create', AuthMiddleware.validateUser,  RemarksController.createRemarkStatus)


module.exports = router;