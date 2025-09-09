const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { GroupsController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  GroupsController.deleteGroup
);

router.post(
  "/",
  AuthMiddleware.validateUser,
  GroupsController.createGroup
);

router.get("/", AuthMiddleware.validateUser, GroupsController.getAll);

router.get("/:id", AuthMiddleware.validateUser, GroupsController.get);

router.post(
  "/:id",
  AuthMiddleware.validateUser,
  GroupsController.updateGroup
);

module.exports = router;
