const express = require("express");
const { ExtensionController } = require("../../c_controllers");
const { AuthMiddleware, ExtensionMiddleware } = require("../../middlewares");

const router = express.Router();

//extension delete: /api/v2/extension/delete POST
router.post("/delete", AuthMiddleware.validateUser, ExtensionMiddleware.validateDeleteRequest, ExtensionController.deleteExtension);

//extension create: /api/v2/extension POST
router.post('/',AuthMiddleware.validateUser,ExtensionMiddleware.validateExtensionCreate,ExtensionMiddleware.modifyExtensionCreateBodyRequest,ExtensionController.createExtension);

// extension update: /api/v2/extension POST
router.post('/:id',AuthMiddleware.validateUser,ExtensionMiddleware.validateExtensionCreate,ExtensionMiddleware.modifyExtensionUpdateBodyRequest,ExtensionController.updateExtension);

//extension getAll: /api/v2/extension GET
router.get("/", AuthMiddleware.validateUser, ExtensionController.getAll);

//extension getByid: /api/v2/extension/:id GET 
router.get("/:id", AuthMiddleware.validateUser, ExtensionController.getById);

module.exports = router;
