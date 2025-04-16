const express = require('express');
const router = express.Router();
const { AuthMiddleware, VoicePlansMiddleware } = require('../../middlewares');
const {VoicePlanController} = require('../../c_controllers');

// Create voice plan api/v2/voice-plan/create
router.post('/create', AuthMiddleware.validateUser, VoicePlansMiddleware.validateVoicePlanRequest,
    VoicePlansMiddleware.modifyVoicePlansCreateBodyRequest, VoicePlanController.createVoicePlans)

// get all voice plan api/v2/voice-plan/
router.get('/', AuthMiddleware.validateUser, VoicePlanController.getAll)

//Update voice plan api/v2/voice-plan/:id
router.post('/:id', AuthMiddleware.validateUser, VoicePlanController.updateVoicePlanStatus)

module.exports = router;