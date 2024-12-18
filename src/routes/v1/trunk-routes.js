const express = require("express");
const { TrunkController } = require("../../controllers");
const { AuthMiddleware, TrunksMiddleware } = require("../../middlewares");

const router = express.Router();

//trunk delete: /api/v1/trunks/delete POST
router.post("/delete", AuthMiddleware.validateUser, TrunksMiddleware.validateDeleteRequest, TrunkController.deleteTrunk);

//trunk create: /api/v1/trunks POST
router.post('/',AuthMiddleware.validateUser,TrunksMiddleware.validateTrunksCreate,TrunksMiddleware.modifyTrunkCreateBodyRequest,TrunkController.createTrunk);

//trunk update: /api/v1/trunks POST
router.post('/:id',AuthMiddleware.validateUser,TrunksMiddleware.validateTrunksCreate,TrunksMiddleware.modifyTrunkUpdateBodyRequest,TrunkController.updateTrunk);

//trunk getAll: /api/v1/trunks GET
router.get("/", AuthMiddleware.validateUser, TrunkController.getAll);

//trunk getByid: /api/v1/trunks/:id GET 
router.get("/:id", AuthMiddleware.validateUser, TrunkController.get);

module.exports = router;
