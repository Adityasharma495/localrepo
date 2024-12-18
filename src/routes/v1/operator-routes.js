const express = require("express");
const { OperatorController } = require("../../controllers");
const { AuthMiddleware, OperatorMiddleware } = require("../../middlewares");

const router = express.Router();

//operator delete: /api/v1/operator/delete POST
router.post("/delete", AuthMiddleware.validateUser, OperatorMiddleware.validateDeleteRequest, OperatorController.deleteOperator);

//operator create: /api/v1/operator POST
router.post('/', AuthMiddleware.validateUser, OperatorMiddleware.validateOperatorCreate, OperatorMiddleware.modifyOperatorCreateBodyRequest, OperatorController.createOperator);

//Operator update: /api/v1/operator POST
router.post('/:id', AuthMiddleware.validateUser, OperatorMiddleware.validateOperatorCreate, OperatorMiddleware.modifyOperatorUpdateBodyRequest, OperatorController.updateOperator);

//Operator getAll: /api/v1/operator GET
router.get("/", AuthMiddleware.validateUser, OperatorController.getAll);

//Operator getByAll: /api/v1/operator/:id GET
router.get("/:id", AuthMiddleware.validateUser, OperatorController.get);

module.exports = router;
