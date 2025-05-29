const express = require('express');
const router = express.Router();

const v2Routes = require('./v2');
const { Logger } = require('../../shared/config');

router.use('/v2', v2Routes);

router.get('/', function(req, res){
    Logger.info('Server -> apis working');
    return res.send('Server apis working');
})

module.exports = router;
