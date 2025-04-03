const express  = require("express")
const router = express.Router();
const {AuthMiddleware} = require("../../middlewares")
const {NumberFileListController} = require("../../c_controllers")

router.get("/", AuthMiddleware.validateUser, NumberFileListController.getAll);



module.exports=router