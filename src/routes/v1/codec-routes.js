const express = require('express');
const { CodecController } = require('../../controllers');
const { AuthMiddleware } = require('../../middlewares');

const router = express.Router();

//Codecs list: /api/v1/codecs GET
router.get('/', AuthMiddleware.validateUser, CodecController.getAll);


module.exports = router;