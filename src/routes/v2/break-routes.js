const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { BreakController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  BreakController.deleteBreak
);

router.post("/", AuthMiddleware.validateUser, BreakController.createBreak);

router.get("/", AuthMiddleware.validateUser, BreakController.getAll);

router.get("/:id", AuthMiddleware.validateUser, BreakController.get);

router.post("/:id", AuthMiddleware.validateUser, BreakController.updateBreak);

module.exports = router;
