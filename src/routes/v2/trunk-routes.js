const express = require("express");
const { AuthMiddleware, TrunksMiddleware } = require("../../middlewares");
const { TrunkController } = require("../../c_controllers");


const router = express.Router();



router.post("/delete", AuthMiddleware.validateUser, TrunksMiddleware.validateDeleteRequest, TrunkController.deleteTrunk);

router.post('/',AuthMiddleware.validateUser,TrunksMiddleware.validateTrunksCreate, TrunksMiddleware.modifyTrunkCreateBodyRequest, TrunkController.createTrunk);

router.get("/", AuthMiddleware.validateUser, TrunkController.getAll);

router.get("/:id", AuthMiddleware.validateUser, TrunkController.get);

router.post('/:id',AuthMiddleware.validateUser,TrunksMiddleware.validateTrunksCreate,TrunksMiddleware.modifyTrunkUpdateBodyRequest,TrunkController.updateTrunk);

module.exports = router;