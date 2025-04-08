const express = require("express");
const { AuthMiddleware, CallCentreMiddleware } = require("../../middlewares");
const { CallCentreController } = require("../../c_controllers");
const ivrRoutes = require("./ivr-routes");

const router = express.Router();

//Company create: /api/v2/call-centres POST
router.post(
  "/",
  AuthMiddleware.validateUser,
  CallCentreMiddleware.validateCreate,
  CallCentreController.create
);

//Company get all: /api/v2/call-centres GET
router.get("/", AuthMiddleware.validateUser, CallCentreController.getAll);

//Company get info: /api/v2/call-centres/:id GET
router.get("/:id", AuthMiddleware.validateUser, CallCentreController.get);

//Company update: /api/v2/call-centres/:id POST
router.post(
  "/:id",
  AuthMiddleware.validateUser,
  CallCentreMiddleware.validateCreate,
  CallCentreController.updateCallCentre
);

//Company get users: /api/v2/call-centres/:id/users GET
router.get(
  "/:id/users",
  AuthMiddleware.validateUser,
  CallCentreController.getUsers
);

router.use(
  "/:cid/ivr",
  function (req, res, next) {
    req.callcentre_id = req.params.cid;
    next();
  },
  ivrRoutes
);

module.exports = router;
