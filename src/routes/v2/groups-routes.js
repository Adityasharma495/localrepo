const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { GroupsController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  GroupsController.deleteSmsWebhook
);

router.post(
  "/",
  AuthMiddleware.validateUser,
  GroupsController.createSmsWebhook
);

router.get("/", AuthMiddleware.validateUser, GroupsController.getAll);

router.get("/:id", AuthMiddleware.validateUser, GroupsController.get);

router.post(
  "/:id",
  AuthMiddleware.validateUser,
  GroupsController.updateSmsWebhook
);

module.exports = router;
