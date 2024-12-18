const express = require('express');
const router = express.Router();
const cityController = require('../../controllers/city-controller');

//Get cities for given state
router.post('/', cityController.getcitiesOfState);

module.exports = router;
