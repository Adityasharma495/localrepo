const {StatusCodes} = require('http-status-codes');
const { ErrorResponse, Helpers, Authentication } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateCompanyRequest(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Company';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.name == undefined || !bodyReq.name.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Company';
        ErrorResponse.error = new AppError(['Company Name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.phone == undefined || !Helpers.validatePhone(bodyReq.phone)) {
        ErrorResponse.message = 'Something went wrong while creating Company';
        ErrorResponse.error = new AppError(['Company Phone not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.address == undefined || !bodyReq.address.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Company';
        ErrorResponse.error = new AppError(['Company Address not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.pincode == undefined) {
        ErrorResponse.message = 'Something went wrong while creating Company';
        ErrorResponse.error = new AppError(['Company Pincode not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

function modifyCompanyCreateBodyRequest (req, res, next) {
    try {

        const inputData = modifyCompanyRequest(req);

        req.body = inputData;
        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating Company';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

function modifyCompanyRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            company: {
                name: bodyReq.name,
                phone: bodyReq.phone,
                address: bodyReq.address,
                pincode: bodyReq.pincode,
            }
        }

        const associatedCompanyCategory = Authentication.getUserAssociatedCompanyCategory(req.user.role);

        if (is_create) {
            inputData.company.created_by = req.user.id
            inputData.company.category = associatedCompanyCategory;
        } 

        return inputData;

    } catch (error) {
        console.log(error);

        throw error;

    }

}

function modifyCompanyUpdateBodyRequest(req, res, next) {

    try {

        const inputData = modifyCompanyRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {

        ErrorResponse.message = 'Something went wrong while updating Server.';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);

    }

}

module.exports = {validateCompanyRequest, modifyCompanyCreateBodyRequest, modifyCompanyRequest, modifyCompanyUpdateBodyRequest}