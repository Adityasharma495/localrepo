const express  = require("express");
const router = express.Router();
const {CompanyController} = require("../../c_controllers")
const {AuthMiddleware, CompanyMiddleware} = require("../../middlewares");


router.post('/', AuthMiddleware.validateUser, CompanyMiddleware.validateCompanyRequest, CompanyMiddleware.modifyCompanyCreateBodyRequest,
    CompanyController.create);

router.get('/', AuthMiddleware.validateUser, CompanyController.getAll);


module.exports = router;