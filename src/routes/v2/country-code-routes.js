const express = require('express');
const { AuthMiddleware, CountryCodeMiddleware } = require('../../middlewares');
const { CountryCodeController } = require("../../c_controllers");

const router = express.Router();

//Country Code delete: /api/v2/country-codes/delete POST
router.post("/delete", AuthMiddleware.validateUser, CountryCodeMiddleware.validateDeleteRequest, CountryCodeController.deleteCountryCode);

//Country Code create: /api/v2/country-codes POST
router.post('/', AuthMiddleware.validateUser, CountryCodeMiddleware.validateCreate, CountryCodeController.create);

//Country Code get all: /api/v2/country-codes GET
router.get('/', AuthMiddleware.validateUser, CountryCodeController.getAll);

//Country Code get info: /api/v2/country-codes/:id GET
router.get('/:id', AuthMiddleware.validateUser, CountryCodeController.get);

//Country Code update: /api/v2/call-centres/:id POST
router.post('/:id', AuthMiddleware.validateUser, CountryCodeMiddleware.validateCreate, CountryCodeController.updateCountryCode);

module.exports = router;