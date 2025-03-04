const express = require("express");
const router = express.Router();


const userRoutes = require('./user-routes');
const creditRoutes = require('./credit-routes');

router.use('/users', userRoutes);
router.use('/credits', creditRoutes)

module.exports = router;
