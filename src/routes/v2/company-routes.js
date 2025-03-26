const express  = require("express");
const router = express.Router();
const {AuthMiddleware, CompanyMiddleware} = require("../../middlewares");


router.post('/', AuthMiddleware.validateUser, CompanyMiddleware.validateCompanyCreate, CompanyController.create);




module.exports = router;