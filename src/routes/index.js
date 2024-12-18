const express = require('express');
const router = express.Router();

const v1Routes = require('./v1');
const { Logger } = require('../config');

router.use('/v1', v1Routes);
router.get('/', function(req, res){
    Logger.info('Server -> apis working');
    return res.send('Server apis working');
})

module.exports = router;
