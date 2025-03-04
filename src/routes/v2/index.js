const express = require("express");
const router = express.Router();


const userRoutes = require('./user-routes');
const creditRoutes = require('./credit-routes');
const userJourney = require('./user-journey-route');

router.use('/users', userRoutes);
router.use('/credits', creditRoutes)
router.use("/user-journey", userJourney);

module.exports = router;
