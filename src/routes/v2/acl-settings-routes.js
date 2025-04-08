const express = require("express")
const router = express.Router();

const {AuthMiddleware, AclSettingsMiddleware} = require("../../middlewares")
const {AclSettingsController} = require("../../c_controllers")

router.get('/', AuthMiddleware.validateUser, AclSettingsController.getAll)

// Delete acl settings api/v2/acl-settings/delete POST
router.post("/delete", AuthMiddleware.validateUser, AclSettingsMiddleware.validateDeleteRequest, AclSettingsController.deleteAclSettings);

// Create acl settings api/v2/acl-settings/create
router.post('/create', AuthMiddleware.validateUser, AclSettingsMiddleware.validateAclSettingsRequest, AclSettingsMiddleware.modifyAclSettingsCreateBodyRequest, AclSettingsController.createAclSettings)

// get acl settings by id api/v2/acl-settings/:id
router.get('/:id', AuthMiddleware.validateUser, AclSettingsController.get)

//Update acl settings api/v2/acl-settings/:id
router.post('/:id', AuthMiddleware.validateUser, AclSettingsMiddleware.validateAclSettingsRequest, AclSettingsMiddleware.modifyAclSettingsUpdateBodyRequest, AclSettingsController.updateAclSettings)

// Delete acl settings api/v2/acl-settings/delete POST
router.post("/delete", AuthMiddleware.validateUser, AclSettingsMiddleware.validateDeleteRequest, AclSettingsController.deleteAclSettings);

module.exports = router;