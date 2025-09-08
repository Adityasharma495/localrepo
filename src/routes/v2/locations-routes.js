const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { LocationController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  LocationController.deleteSmsWebhook
);

router.post(
  "/",
  AuthMiddleware.validateUser,
  LocationController.createSmsWebhook
);

router.get("/", AuthMiddleware.validateUser, LocationController.getAll);

router.get("/:id", AuthMiddleware.validateUser, LocationController.get);

router.post(
  "/:id",
  AuthMiddleware.validateUser,
  LocationController.updateSmsWebhook
);

module.exports = router;
