const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { SmsWebhookController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  SmsWebhookController.deleteSmsWebhook
);

router.post("/", AuthMiddleware.validateUser, SmsWebhookController.createSmsWebhook);

router.get("/", AuthMiddleware.validateUser, SmsWebhookController.getAll);

router.get("/:id", AuthMiddleware.validateUser, SmsWebhookController.get);

router.post("/:id", AuthMiddleware.validateUser, SmsWebhookController.updateSmsWebhook);

module.exports = router;
