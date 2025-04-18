const express  = require("express");
const router = express.Router();
const {CompanyController} = require("../../c_controllers")
const {AuthMiddleware, CompanyMiddleware} = require("../../middlewares");


router.post('/', AuthMiddleware.validateUser, CompanyMiddleware.validateCompanyRequest, CompanyMiddleware.modifyCompanyCreateBodyRequest,
    CompanyController.create);

router.get('/', AuthMiddleware.validateUser, CompanyController.getAll);

router.get('/:id', AuthMiddleware.validateUser, CompanyController.get); 

router.post('/:id', AuthMiddleware.validateUser, CompanyMiddleware.validateCompanyRequest, CompanyMiddleware.modifyCompanyUpdateBodyRequest,
    CompanyController.updateCompany);


module.exports = router;