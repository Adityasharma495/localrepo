const express = require("express");
const router = express.Router();
const { CreditController } = require("../../c_controllers");
const { CreditMiddleware, AuthMiddleware } = require("../../middlewares");

// get all credit update api/v2/credits/
router.get("/", AuthMiddleware.validateUser, CreditController.getAll);

// get credit update by id api/v2/credits/:id
router.get("/:id", AuthMiddleware.validateUser, CreditController.get);

// Update credit update api/v2/credits/:id
router.post(
  "/:id",
  AuthMiddleware.validateUser,
  CreditMiddleware.validateUpdateRequest,
  CreditController.updateCredit
);

module.exports = router;
