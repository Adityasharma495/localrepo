const { StatusCodes } = require('http-status-codes');

const { ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');
const { Authentication } = require('../utils/common');

async function validateUser(req, res, next){
    try {
        const token = req.headers['authorization'];
        const decodeJwt = await Authentication.verifyJWToken(token);
        if(decodeJwt){
            req['user'] = decodeJwt;

            next();
        }

    } catch (error) {
        
        const statusCode = error.name == 'JsonWebTokenError' ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
        ErrorResponse.message = error.message;
        ErrorResponse.error = new AppError(error.message, statusCode);
        return res
            .status(statusCode)
            .json(ErrorResponse);

    }

}


module.exports = {
    validateUser
}