const express = require('express');
const { LanguageController } = require('../../controllers');
const { AuthMiddleware } = require('../../middlewares');

const router = express.Router();

//langugage list: /api/v1/langugage GET
router.get('/', AuthMiddleware.validateUser, LanguageController.getAll);


module.exports = router;