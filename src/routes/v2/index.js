const express = require("express");
const router = express.Router();


const userRoutes = require('./user-routes');
const creditRoutes = require('./credit-routes');
const userJourney = require('./user-journey-route');
const serverManagement = require('./server-management-routes');
const dataCenter = require('./data-center-routes');

router.use('/users', userRoutes);
router.use('/credits', creditRoutes);
router.use('/user-journey', userJourney);
router.use('/server-management', serverManagement);
router.use('/data-center', dataCenter);

module.exports = router;
