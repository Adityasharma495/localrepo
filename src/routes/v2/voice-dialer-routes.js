const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { VoiceDialerController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  VoiceDialerController.deleteSmsWebhook
);

router.post(
  "/",
  AuthMiddleware.validateUser,
  VoiceDialerController.createSmsWebhook
);

router.get("/", AuthMiddleware.validateUser, VoiceDialerController.getAll);

router.get("/:id", AuthMiddleware.validateUser, VoiceDialerController.get);

router.post(
  "/:id",
  AuthMiddleware.validateUser,
  VoiceDialerController.updateSmsWebhook
);

module.exports = router;
