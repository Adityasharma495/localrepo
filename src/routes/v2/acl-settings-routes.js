const express = require("express")
const router = express.Router();

const {AuthMiddleware} = require("../../middlewares")
const {AclSettingsController} = require("../../c_controllers")

router.get('/', AuthMiddleware.validateUser, AclSettingsController.getAll)

module.exports = router;