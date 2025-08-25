const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { WebhookController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  WebhookController.deleteWebhook
);

router.post("/", AuthMiddleware.validateUser, WebhookController.createWebhook);

router.get("/", AuthMiddleware.validateUser, WebhookController.getAll);

router.get("/:id", AuthMiddleware.validateUser, WebhookController.get);

router.post("/:id", AuthMiddleware.validateUser, WebhookController.updateWebhook);

module.exports = router;
