const express = require("express");
const { VoiceCampaignMiddleware, AuthMiddleware } = require("../../middlewares");
const { VoiceCampaignController } = require("../../c_controllers");
const router = express.Router();

router.post('/', AuthMiddleware.validateUser, VoiceCampaignMiddleware.ValidateVoiceCampaign,VoiceCampaignController.CreateVoiceCampaign)
router.get('/', AuthMiddleware.validateUser ,VoiceCampaignController.getCampaigns)
router.get('/:id', AuthMiddleware.validateUser ,VoiceCampaignController.getOne)


module.exports = router;