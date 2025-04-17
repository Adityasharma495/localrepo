const express = require('express');
const { AuthMiddleware , CompanyMiddleware} = require('../../middlewares');
const { CompanyController } = require('../../controllers');

const router = express.Router();

//Company create: /api/v1/companies POST
router.post('/', AuthMiddleware.validateUser, CompanyMiddleware.validateCompanyRequest, CompanyMiddleware.modifyCompanyCreateBodyRequest,
    CompanyController.create);

//Company get all: /api/v1/companies GET
router.get('/', AuthMiddleware.validateUser, CompanyController.getAll);

//Company get info: /api/v1/companies/:id GET
router.get('/:id', AuthMiddleware.validateUser, CompanyController.get); 

//Company update: /api/v1/companies/:id POST
router.post('/:id', AuthMiddleware.validateUser, CompanyMiddleware.validateCompanyRequest, CompanyMiddleware.modifyCompanyUpdateBodyRequest,
    CompanyController.updateCompany);

module.exports = router;