const express = require("express");
const { VoiceCampaignMiddleware, AuthMiddleware } = require("../../middlewares");
const { VoiceCampaignController } = require("../../c_controllers");
const router = express.Router();

router.post('/',VoiceCampaignMiddleware.ValidateVoiceCampaign,VoiceCampaignController.CreateVoiceCampaign)


module.exports = router;