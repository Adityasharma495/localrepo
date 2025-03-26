const express = require("express");
const { ExtensionController } = require("../../controllers");
const { AuthMiddleware, ExtensionMiddleware } = require("../../middlewares");

const router = express.Router();

//extension delete: /api/v1/extension/delete POST
router.post("/delete", AuthMiddleware.validateUser, ExtensionMiddleware.validateDeleteRequest, ExtensionController.deleteExtension);

//extension create: /api/v1/extension POST
router.post('/',AuthMiddleware.validateUser,ExtensionMiddleware.validateExtensionCreate,ExtensionMiddleware.modifyExtensionCreateBodyRequest,ExtensionController.createExtension);

// extension update: /api/v1/extension POST
router.post('/:id',AuthMiddleware.validateUser,ExtensionMiddleware.validateExtensionCreate,ExtensionMiddleware.modifyExtensionUpdateBodyRequest,ExtensionController.updateExtension);

//extension getAll: /api/v1/extension GET
router.get("/", AuthMiddleware.validateUser, ExtensionController.getAll);

//extension getByid: /api/v1/extension/:id GET 
router.get("/:id", AuthMiddleware.validateUser, ExtensionController.getById);

module.exports = router;
