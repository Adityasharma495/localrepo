const express = require("express");
const router = express.Router();


const userRoutes = require('./user-routes');
const creditRoutes = require('./credit-routes');
const userJourney = require('./user-journey-route');
const serverManagement = require('./server-management-routes');
const dataCenter = require('./data-center-routes');
const trunkRoutes = require('./trunk-routes');
const prompt = require('./prompts-routes');
const numbers = require('./numbers-routes');
const ivrRoutes = require("./ivr-routes");


router.use('/users', userRoutes);
router.use('/credits', creditRoutes);
router.use('/user-journey', userJourney);
router.use('/server-management', serverManagement);
router.use('/data-center', dataCenter);
router.use('/trunks', trunkRoutes);
router.use('/prompt', prompt);
router.use('/numbers', numbers);
router.use('/ivr', ivrRoutes);

module.exports = router;
