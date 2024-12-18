const express = require('express');
const { AuthMiddleware } = require('../../middlewares');

const { UtilityController } = require("../../controllers");

const router = express.Router();

//Timezones get all: /api/v1/timezones GET
router.get('/', AuthMiddleware.validateUser, UtilityController.getAllTimezones);

module.exports = router;