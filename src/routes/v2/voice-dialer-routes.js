const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { VoiceDialerController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  VoiceDialerController.deleteDialer
);

router.post(
  "/",
  AuthMiddleware.validateUser,
  VoiceDialerController.createDialer
);

router.get("/", AuthMiddleware.validateUser, VoiceDialerController.getAll);

router.get("/:id", AuthMiddleware.validateUser, VoiceDialerController.get);

router.post(
  "/:id",
  AuthMiddleware.validateUser,
  VoiceDialerController.updateDialer
);

module.exports = router;
