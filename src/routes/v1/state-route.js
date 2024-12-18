const express = require('express');
const router = express.Router();
const stateController = require('../../controllers/state-controller');

//Get states for given country
router.post('/', stateController.getStatesOfCountry);

module.exports = router;
