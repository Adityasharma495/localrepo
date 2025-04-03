const express = require('express');
const router = express.Router();
const { CityController } = require('../../c_controllers');

//Get cities for given state
router.post('/', CityController.getcitiesOfState);

module.exports = router;
