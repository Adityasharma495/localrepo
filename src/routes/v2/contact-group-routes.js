const express = require("express");
const { AuthMiddleware } = require("../../middlewares");
const { ContactGroupController } = require("../../c_controllers");

const router = express.Router();


router.post("/", AuthMiddleware.validateUser, ContactGroupController.createContactGroup);

router.post("/import/:id", AuthMiddleware.validateUser, ContactGroupController.uploadMembers);

router.get("/", AuthMiddleware.validateUser, ContactGroupController.getAll);

router.get("/:id", AuthMiddleware.validateUser, ContactGroupController.get);


module.exports = router;
