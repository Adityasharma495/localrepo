const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { LocationController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  LocationController.deleteLocation
);

router.post(
  "/",
  AuthMiddleware.validateUser,
  LocationController.createLocation
);

router.get("/", AuthMiddleware.validateUser, LocationController.getAll);

router.get("/:id", AuthMiddleware.validateUser, LocationController.get);

router.post(
  "/:id",
  AuthMiddleware.validateUser,
  LocationController.updateLocation
);

module.exports = router;
