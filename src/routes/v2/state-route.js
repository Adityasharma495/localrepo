const express = require('express');
const router = express.Router();
const { StateController } = require('../../c_controllers');

//Get states for given country
router.post('/', StateController.getStatesOfCountry);

module.exports = router;
