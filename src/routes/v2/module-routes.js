const express = require("express");
const { ModuleController } = require("../../c_controllers");
const { AuthMiddleware, ModuleMiddleware } = require("../../middlewares");

const router = express.Router();

//module delete: /api/v2/module/delete POST
router.post("/delete", AuthMiddleware.validateUser, ModuleMiddleware.validateDeleteRequest, ModuleController.deleteModule);

//module create: /api/v2/module POST
router.post('/',AuthMiddleware.validateUser,ModuleMiddleware.validateModuleCreate,ModuleMiddleware.modifyModuleCreateBodyRequest,ModuleController.createModule);

// module update: /api/v2/module POST
router.post('/:id',AuthMiddleware.validateUser,ModuleMiddleware.validateModuleCreate,ModuleMiddleware.modifyModuleUpdateBodyRequest,ModuleController.updateModule);

//module getAll: /api/v2/module GET
router.get("/", AuthMiddleware.validateUser, ModuleController.getAll);

//module getByid: /api/v2/module/:id GET 
router.get("/:id", AuthMiddleware.validateUser, ModuleController.getById);

module.exports = router;
