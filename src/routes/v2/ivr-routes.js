const express = require("express");
const { IVRController } = require("../../c_controllers");
const { AuthMiddleware, IVRMiddleWare } = require("../../middlewares");

const router = express.Router();

//IVR get : /api/v2/ivr/settings
router.get('/settings',AuthMiddleware.validateUser,IVRController.getIVRSettings);

//IVR delete: /api/v2/ivr/delete POST
router.post("/delete", AuthMiddleware.validateUser, IVRMiddleWare.validateDeleteRequest, IVRController.deleteIVR);

//IVR create: /api/v2/ivr POST
router.post("/", AuthMiddleware.validateUser, IVRMiddleWare.validateIVRCreate , IVRMiddleWare.modifyIVRCreateBodyRequest, IVRController.createIVR);

//IVR Update: /api/v2/ivr POST
router.post("/:id", AuthMiddleware.validateUser, IVRMiddleWare.validateIVRCreate , IVRMiddleWare.modifyIVRUpdateBodyRequest, IVRController.updateIVR);

//IVR getAll: /api/v2/ivr GET
router.get('/', AuthMiddleware.validateUser, IVRController.getAllIVR);

//IVR getAll: /api/v2/ivr/:id GET
router.get('/:id', AuthMiddleware.validateUser, IVRController.getIVRByFlowId);

module.exports = router;
