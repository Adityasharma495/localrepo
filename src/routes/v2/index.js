const express = require("express");
const router = express.Router();


const userRoutes = require('./user-routes');
const creditRoutes = require('./credit-routes');
const userJourney = require('./user-journey-route');
const serverManagement = require('./server-management-routes');
const dataCenter = require('./data-center-routes');
const trunkRoutes = require('./trunk-routes');
const agentRoutes = require("./agent-routes")
const CodecRoutes = require("./codec-routes")
const prompt = require('./prompts-routes');
const numbers = require('./numbers-routes');
const ivrRoutes = require("./ivr-routes");
const cityRoute = require("./city-routes");
const stateRoute = require("./state-route");
const timezoneRoutes = require('./timezone-routes');
const languageRoute = require('./language-routes.js');
const codecRoutes = require('./codec-routes');
const moduleRoute = require("./module-routes");
const operatorRoutes = require("./operator-routes");


router.use('/users', userRoutes);
router.use('/credits', creditRoutes);
router.use('/user-journey', userJourney);
router.use('/server-management', serverManagement);
router.use('/data-center', dataCenter);
router.use('/trunks', trunkRoutes);
router.use('/agents', agentRoutes);
router.use('/operators', operatorRoutes);
router.use('/codecs', CodecRoutes);
router.use('/prompt', prompt);
router.use('/numbers', numbers);
router.use('/ivr', ivrRoutes);
router.use('/city', cityRoute);
router.use('/states', stateRoute);
router.use('/timezones', timezoneRoutes);
router.use('/language', languageRoute);
router.use('/codecs', codecRoutes);
router.use('/module', moduleRoute);
router.use('/operators', operatorRoutes);

module.exports = router;
