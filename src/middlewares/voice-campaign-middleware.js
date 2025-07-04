const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../../shared/utils/common');
const AppError = require('../../shared/utils/errors/app-error');


function ValidateVoiceCampaign(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Voice Campaign';
        ErrorResponse.error = new AppError(['Invalid content type, request must be application/json'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // Required Fields
    const requiredFields = [
        { field: 'campaign_name', label: 'Campaign Name' },
    ];

    const missing = requiredFields.filter(({ field }) => !bodyReq[field] || (typeof bodyReq[field] === 'string' && !bodyReq[field].trim()));

    if (missing.length > 0) {
        const errors = missing.map(({ label }) => `${label} is required`);
        ErrorResponse.message = `Missing required fields in Voice Campaign request, ${errors}`;
        ErrorResponse.error = new AppError(errors, StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // ENUM validation
    const validTargetTypes = ['agent', 'team', 'customer'];
    // const validTypeRuns = ['a', 'm'];

    if (bodyReq.target_type && !validTargetTypes.includes(bodyReq.target_type)) {
        ErrorResponse.message = 'Invalid target_type';
        ErrorResponse.error = new AppError([`target_type must be one of: ${validTargetTypes.join(', ')}`], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // if (!validTypeRuns.includes(bodyReq.type_run)) {
    //     ErrorResponse.message = 'Invalid type_run';
    //     ErrorResponse.error = new AppError([`type_run must be one of: ${validTypeRuns.join(', ')}`], StatusCodes.BAD_REQUEST);
    //     return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    // }

    next();
}

module.exports = {
    ValidateVoiceCampaign
};
