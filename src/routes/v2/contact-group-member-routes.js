const express = require("express");
const {
  AuthMiddleware,
  ContactGroupMembersMiddleware,
} = require("../../middlewares");
const { ContactGroupMemberController } = require("../../c_controllers");

const router = express.Router();

router.post(
  "/delete",
  AuthMiddleware.validateUser,
  ContactGroupMemberController.deleteContactGroupMember
);

router.post(
  "/",
  AuthMiddleware.validateUser,
  ContactGroupMemberController.createContactGroupMember
);

router.get(
  "/",
  AuthMiddleware.validateUser,
  ContactGroupMemberController.getAll
);

router.get(
  "/:id",
  AuthMiddleware.validateUser,
  ContactGroupMemberController.get
);

router.get(
  "/all/members",
  AuthMiddleware.validateUser,
  ContactGroupMemberController.getAllContacts
);

router.post(
  "/:id",
  AuthMiddleware.validateUser,
  ContactGroupMemberController.updateContactGroupMember
);

router.get(
  "/contact-group/:id",
  AuthMiddleware.validateUser,
  ContactGroupMemberController.getUnderOneContactGroup
);

router.post(
  "/upload/file",
  AuthMiddleware.validateUser,
  ContactGroupMembersMiddleware.upload,
  ContactGroupMembersMiddleware.validateUploadData,
  ContactGroupMembersMiddleware.saveFile,
  ContactGroupMemberController.uploadMembersData
);

module.exports = router;
