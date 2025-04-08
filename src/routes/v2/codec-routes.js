const express = require('express');
const { CodecsController } = require('../../c_controllers');
const { AuthMiddleware } = require('../../middlewares');

const router = express.Router();

//Codecs list: /api/v2/codecs GET
router.get('/', AuthMiddleware.validateUser, CodecsController.getAll);


module.exports = router;