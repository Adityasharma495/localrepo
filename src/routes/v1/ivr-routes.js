const express = require("express");
const { IVRController } = require("../../controllers");
const { AuthMiddleware, IVRMiddleWare } = require("../../middlewares");

const router = express.Router();

//IVR get : /api/v1/ivr/settings
router.get('/settings',AuthMiddleware.validateUser,IVRController.getIVRSettings);

//IVR delete: /api/v1/ivr/delete POST
router.post("/delete", AuthMiddleware.validateUser, IVRMiddleWare.validateDeleteRequest, IVRController.deleteIVR);

//IVR create: /api/v1/ivr POST
router.post("/", AuthMiddleware.validateUser, IVRMiddleWare.validateIVRCreate , IVRMiddleWare.modifyIVRCreateBodyRequest, IVRController.createIVR);

//IVR Update: /api/v1/ivr POST
router.post("/:id", AuthMiddleware.validateUser, IVRMiddleWare.validateIVRCreate , IVRMiddleWare.modifyIVRUpdateBodyRequest, IVRController.updateIVR);

//IVR getAll: /api/v1/ivr GET
router.get('/', AuthMiddleware.validateUser, IVRController.getAllIVR);

//IVR getAll: /api/v1/ivr/view/:id GET
router.get('/:id', AuthMiddleware.validateUser, IVRController.getIVRByFlowId);

module.exports = router;
