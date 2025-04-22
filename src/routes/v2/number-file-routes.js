const express  = require("express")
const router = express.Router();
const { AuthMiddleware, NumberFileListMiddleware } = require("../../middlewares");
const {NumberFileListController} = require("../../c_controllers")

router.get("/", AuthMiddleware.validateUser, NumberFileListController.getAll);

router.post("/delete", AuthMiddleware.validateUser, NumberFileListMiddleware.validateDeleteRequest, NumberFileListController.deleteNumberFile);


module.exports=router