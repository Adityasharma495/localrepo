const express = require("express");
const { NumberFileListController } = require("../../controllers");
const { AuthMiddleware, NumberFileListMiddleware } = require("../../middlewares");

const router = express.Router();

//Number File delete: /api/v1/number-filelist/delete POST
router.post("/delete", AuthMiddleware.validateUser, NumberFileListMiddleware.validateDeleteRequest, NumberFileListController.deleteNumberFile);

//Number file List getAll: /api/v1/number-filelist GET
router.get("/", AuthMiddleware.validateUser, NumberFileListController.getAll);

module.exports = router;
