const express = require('express');
const { LanguageController } = require('../../c_controllers');
const { AuthMiddleware } = require('../../middlewares');

const router = express.Router();

//langugage list: /api/v2/langugage GET
router.get('/', AuthMiddleware.validateUser, LanguageController.getAll);


module.exports = router;