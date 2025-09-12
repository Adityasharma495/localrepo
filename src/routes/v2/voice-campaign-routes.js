const express = require("express");
const { VoiceCampaignMiddleware, AuthMiddleware } = require("../../middlewares");
const { VoiceCampaignController } = require("../../c_controllers");
const router = express.Router();

router.post('/singlecall',VoiceCampaignController.HandleSingleCall)
router.post('/', AuthMiddleware.validateUser, VoiceCampaignMiddleware.ValidateVoiceCampaign,VoiceCampaignController.CreateVoiceCampaign)
router.get('/', AuthMiddleware.validateUser ,VoiceCampaignController.getCampaigns)
router.get('/:id', AuthMiddleware.validateUser ,VoiceCampaignController.getOne)
router.post('/:id', AuthMiddleware.validateUser, VoiceCampaignController.UpdateVoiceCampaign)


module.exports = router;