const express = require("express");
const { ExtentionController } = require("../../controllers");
const { AuthMiddleware, ExtentionMiddleware } = require("../../middlewares");

const router = express.Router();

//extention delete: /api/v1/extention/delete POST
router.post("/delete", AuthMiddleware.validateUser, ExtentionMiddleware.validateDeleteRequest, ExtentionController.deleteExtention);

//extention create: /api/v1/extention POST
router.post('/',AuthMiddleware.validateUser,ExtentionMiddleware.validateExtentionCreate,ExtentionMiddleware.modifyExtentionCreateBodyRequest,ExtentionController.createExtention);

// extention update: /api/v1/extention POST
router.post('/:id',AuthMiddleware.validateUser,ExtentionMiddleware.validateExtentionCreate,ExtentionMiddleware.modifyExtentionUpdateBodyRequest,ExtentionController.updateExtention);

//extention getAll: /api/v1/extention GET
router.get("/", AuthMiddleware.validateUser, ExtentionController.getAll);

//extention getByid: /api/v1/extention/:id GET 
router.get("/:id", AuthMiddleware.validateUser, ExtentionController.getById);

module.exports = router;
