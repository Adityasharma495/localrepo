const express = require('express');
const router = express.Router();
const { AuthMiddleware, VoicePlansMiddleware } = require('../../middlewares');
const {VoicePlansController} = require('../../controllers');

// Create voice plan api/v1/voice-plan/create
router.post('/create', AuthMiddleware.validateUser, VoicePlansMiddleware.validateVoicePlanRequest,
    VoicePlansMiddleware.modifyVoicePlansCreateBodyRequest, VoicePlansController.createVoicePlans)

// get all voice plan api/v1/voice-plan/
router.get('/', AuthMiddleware.validateUser, VoicePlansController.getAll)

//Update voice plan api/v1/voice-plan/:id
router.post('/:id', AuthMiddleware.validateUser, VoicePlansController.updateVoicePlanStatus)

module.exports = router;