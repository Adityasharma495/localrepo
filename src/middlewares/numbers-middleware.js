const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../../shared/utils/common');
const AppError = require('../../shared/utils/errors/app-error');
const { constants } = require('../../shared/utils/common');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { NumbersRepository } = require('../../shared/c_repositories');
const numberRepository = new NumbersRepository();
const { Readable } = require('stream');
const csvParser = require('csv-parser');

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function validateCreate(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Numbers';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.numberType == undefined || !bodyReq.numberType.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Numbers';
        ErrorResponse.error = new AppError(['numberType not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.currency == undefined || !bodyReq.currency.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Numbers';
        ErrorResponse.error = new AppError(['currency not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.countryCode == undefined || !bodyReq.currency.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Numbers';
        ErrorResponse.error = new AppError(['currency not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.DID == undefined || !bodyReq.DID.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Numbers';
        ErrorResponse.error = new AppError(['DID not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.cost == undefined ) {
        ErrorResponse.message = 'Something went wrong while creating Numbers';
        ErrorResponse.error = new AppError(['cost not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.operator == undefined || !bodyReq.operator.trim()) {
        ErrorResponse.message = 'Something went wrong while creating Numbers';
        ErrorResponse.error = new AppError(['operator not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    if (bodyReq.numberType !== undefined && bodyReq.numberType === 'DID') {
        if (bodyReq.category == undefined || !bodyReq.category.trim()) {
            ErrorResponse.message = 'Something went wrong while creating creating Numbers';
            ErrorResponse.error = new AppError(['category not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }

        if (bodyReq.stateCode == undefined) {
            ErrorResponse.message = 'Something went wrong while creating creating Numbers';
            ErrorResponse.error = new AppError(['stateCode not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }
    next();

}

function modifyNumberCreateBodyRequest (req, res, next) {
    try {

        const inputData = modifyNumberRequest(req);
        req.body = inputData;

        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while creating Number';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

function modifyNumberRequest(req, is_create = true) {

    try {

        const bodyReq = req.body;
        let inputData = {
            number: {
                status: bodyReq?.status,
                actual_number: Number(bodyReq.DID),
                category: null,
                currency: bodyReq.currency,
                country_code: bodyReq.countryCode,
                state_code: null,
                cost: bodyReq.cost,
                operator: bodyReq.operator,
                number_type: bodyReq.numberType
            }
        }

        if (bodyReq.numberType === 'DID') {
            inputData.number.category = bodyReq.category
            inputData.number.state_code = bodyReq.stateCode
        }

        if (bodyReq.numberType !== 'DID') {
            inputData.number.category = null
            inputData.number.state_code = null
        }

        if (is_create) {
            inputData.number.created_by = req.user.id
            inputData.number.status = Number(1) // default status is Available(1)
        }
        return inputData;
    } catch (error) {
        console.log(error);
        throw error;

    }

}

function validateUpdate(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Updating Numbers.'
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.numberType == undefined || !bodyReq.numberType.trim()) {
        ErrorResponse.message = 'Something went wrong while Updating Numbers';
        ErrorResponse.error = new AppError(['numberType not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.currency == undefined || !bodyReq.currency.trim()) {
        ErrorResponse.message = 'Something went wrong while Updating Numbers';
        ErrorResponse.error = new AppError(['currency not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.countryCode == undefined || !bodyReq.currency.trim()) {
        ErrorResponse.message = 'Something went wrong while Updating Numbers';
        ErrorResponse.error = new AppError(['currency not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.DID == undefined) {
        ErrorResponse.message = 'Something went wrong while Updating Numbers';
        ErrorResponse.error = new AppError(['DID not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.cost == undefined ) {
        ErrorResponse.message = 'Something went wrong while Updating Numbers';
        ErrorResponse.error = new AppError(['cost not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.operator == undefined || !bodyReq.operator.trim()) {
        ErrorResponse.message = 'Something went wrong while Updating Numbers';
        ErrorResponse.error = new AppError(['operator not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    if (bodyReq.numberType !== undefined && bodyReq.numberType === 'DID') {
        if (bodyReq.category == undefined || !bodyReq.category.trim()) {
            ErrorResponse.message = 'Something went wrong while creating Updating Numbers';
            ErrorResponse.error = new AppError(['category not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }

        if (bodyReq.stateCode == undefined) {
            ErrorResponse.message = 'Something went wrong while creating Updating Numbers';
            ErrorResponse.error = new AppError(['stateCode not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }
    next();

}

async function validateBulkUpdate(req, res, next) {
    const bodyReq = Object.assign({}, req.body);
    if (!req.is('multipart/form-data')) {
        ErrorResponse.message = 'Something went wrong while Bulk Update.';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in multipart/form-data format'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    } 
    else if (bodyReq.numberType == undefined || !bodyReq.numberType.trim()) {
        ErrorResponse.message = 'Something went wrong while Bulk Update.';
        ErrorResponse.error = new AppError(['numberType not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    const file = req.file;
    const allowedFileType = '.csv';
    
    // Check if the file is present
    if (!file) {
        ErrorResponse.message = 'File is missing';
        ErrorResponse.error = new AppError(['No file uploaded'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    
    // Check the file extension
    const fileExtension = path.extname(file.originalname);
    if (fileExtension !== allowedFileType) {
        ErrorResponse.message = 'Invalid file type';
        ErrorResponse.error = new AppError([`Invalid file type, only ${allowedFileType} files are allowed`], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    
    // Validate CSV columns
    try {
        if (bodyReq.numberType !== undefined && bodyReq.numberType === 'DID') {
            await validateCsvColumns(file.buffer, constants.NUMBERS_CONSTANTS.BULK_UPDATE_DID);

        } else {
            await validateCsvColumns(file.buffer, constants.NUMBERS_CONSTANTS.BULK_UPDATE_OTHERS);
        }
    } catch (error) {
        ErrorResponse.message = 'Issue with File Validation while Bulk Update.';
        ErrorResponse.error = new AppError([error.message], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function modifyNumberUpdateBodyRequest (req, res, next) {
    try {

        const inputData = modifyNumberRequest(req, false);
        req.body = inputData;
        next();

    } catch (error) {
        ErrorResponse.message = 'Something went wrong while Updating Number';
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
    
}

async function validateUploadNumbers(req, res, next) {
    const bodyReq = Object.assign({}, req.body);
    if (!req.is('multipart/form-data')) {
        ErrorResponse.message = 'Something went wrong while uploading numbers';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in multipart/form-data format'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    } 
    else if (bodyReq.numberType == undefined || !bodyReq.numberType.trim()) {
        ErrorResponse.message = 'Something went wrong while creating uploading numbers';
        ErrorResponse.error = new AppError(['numberType not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.currency == undefined || !bodyReq.currency.trim()) {
        ErrorResponse.message = 'Something went wrong while creating uploading numbers';
        ErrorResponse.error = new AppError(['currency not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    if (bodyReq.numberType !== undefined && bodyReq.numberType === 'DID') {
        if (bodyReq.category == undefined || !bodyReq.category.trim()) {
            ErrorResponse.message = 'Something went wrong while creating uploading numbers';
            ErrorResponse.error = new AppError(['category not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }

    const file = req.file;
    const allowedFileType = '.csv';
    
    // Check if the file is present
    if (!file) {
        ErrorResponse.message = 'File is missing';
        ErrorResponse.error = new AppError(['No file uploaded'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    
    // Check the file extension
    const fileExtension = path.extname(file.originalname);
    if (fileExtension !== allowedFileType) {
        ErrorResponse.message = 'Invalid file type';
        ErrorResponse.error = new AppError([`Invalid file type, only ${allowedFileType} files are allowed`], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    
    // Validate CSV columns
    try {
        if (bodyReq.numberType !== undefined && bodyReq.numberType === 'DID') {
            await validateCsvColumns(file.buffer, constants.NUMBERS_CONSTANTS.DID_FILE_CLOUMNS);

        } else {
            await validateCsvColumns(file.buffer, constants.NUMBERS_CONSTANTS.OTHER_FILE_COLUMN);
        }
    } catch (error) {
        ErrorResponse.message = 'Issue with File Validation';
        ErrorResponse.error = new AppError([error.message], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    req.folder = `../../assets/number/${req?.user?.id.toString()}`
    next();
}

function saveFile(req, res, next) {
    const file = req.file;
    const folder = req.folder;
    const destFolder = path.join(__dirname, folder);
            
    // Current date and time for filename
    const currentDate = new Date();
    const indiaOffset = 5.5 * 60 * 60 * 1000; 
    const indiaTime = new Date(currentDate.getTime() + indiaOffset);
    const formattedDate = indiaTime.toISOString().replace(/:/g, '-'); 
    const originalFileName = path.basename(file.originalname);
    const newFileName = `${formattedDate}_${originalFileName}`;
        
        const filePath = path.join(destFolder, newFileName);
        req.file.path = filePath; 
        req.file.name = newFileName

        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }

        fs.writeFile(filePath, file.buffer, (err) => {
            if (err) {
                ErrorResponse.message = 'Error saving file';
                ErrorResponse.error = new Error('Error saving file to disk');
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
            }
        next();
        });
}

function validateCsvColumns(fileBuffer, REQUIRED_COLUMNS) {
    return new Promise((resolve, reject) => {
        const columns = new Set();
        let headersChecked = false;
        let dataRowProcessed = false;

        const readableStream = Readable.from([fileBuffer]);

        readableStream
            .pipe(csvParser())
            .on('headers', (headers) => {
                headers.forEach(header => columns.add(header));
                headersChecked = true;

                const missingColumns = REQUIRED_COLUMNS.filter(column => !columns.has(column));
                if (missingColumns.length > 0) {
                    readableStream.destroy();
                    reject(new Error(`Missing columns: ${missingColumns.join(', ')}`));
                }
            })
            .on('data', () => {
                dataRowProcessed = true;
                if (headersChecked) {
                    readableStream.destroy();
                    resolve();
                }
            })
            .on('end', () => {
                if (headersChecked && !dataRowProcessed) {
                    reject(new Error('Uploaded file is empty'));
                }
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

function isNumberExistInCollection(act_Number, isDeleted) {

    const actNumber = Number(act_Number);
    return numberRepository.isActualNumberExist(actNumber, isDeleted);
}

function validateDeleteRequest (req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while Deleting Numbers';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.numberIds == undefined || typeof bodyReq.numberIds !== 'object' || !bodyReq.numberIds.length > 0) {
        ErrorResponse.message = 'Something went wrong while Deleting Numbers';
        ErrorResponse.error = new AppError(['numberIds not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

async function validateBulkAssignDID(req, res, next) {
    const bodyReq = Object.assign({}, req.body);
    if (!req.is('multipart/form-data')) {
        ErrorResponse.message = 'Something went wrong while Assigning DID';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in multipart/form-data format'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    } 
    else if (bodyReq.type == undefined || !bodyReq.type.trim()) {
        ErrorResponse.message = 'Something went wrong while Assigning DID';
        ErrorResponse.error = new AppError(['type not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    const file = req.file;
    const allowedFileType = '.csv';
    
    // Check if the file is present
    if (!file) {
        ErrorResponse.message = 'File is missing';
        ErrorResponse.error = new AppError(['No file uploaded'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    
    // Check the file extension
    const fileExtension = path.extname(file.originalname);
    if (fileExtension !== allowedFileType) {
        ErrorResponse.message = 'Invalid file type';
        ErrorResponse.error = new AppError([`Invalid file type, only ${allowedFileType} files are allowed`], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    
    // Validate CSV columns
    try {
        if (bodyReq.type !== undefined && bodyReq.type === 'VMN') {
            await validateCsvColumns(file.buffer, constants.NUMBERS_CONSTANTS.UPLOAD_DID_VMN_COLUMN);

        } else {
            await validateCsvColumns(file.buffer, constants.NUMBERS_CONSTANTS.UPLOAD_DID_TOLLFREE_COLUMN);
        }
    } catch (error) {
        ErrorResponse.message = 'Missing Required Columns';
        ErrorResponse.error = new AppError([error.message], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (bodyReq.type !== undefined && bodyReq.type === 'VMN') {
        req.folder = `../../assets/assignDIDbulk/VMN/${req?.user?.id.toString()}`
    } else {
        req.folder = `../../assets/assignDIDbulk/TOLLFREE/${req?.user?.id.toString()}`
    }

    next();
}

async function validateIndividualAssignDID(req, res, next) {
    const bodyReq = req.body;
    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while assigning individual DID.';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.numberType == undefined || !bodyReq.numberType.trim()) {
        ErrorResponse.message = 'Something went wrong while assigning individual DID.';
        ErrorResponse.error = new AppError(['numberType not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.DID == undefined || !bodyReq.DID.trim()) {
        ErrorResponse.message = 'Something went wrong while assigning individual DID.';
        ErrorResponse.error = new AppError(['DID not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.status == undefined ) {
        ErrorResponse.message = 'Something went wrong while assigning individual DID.';
        ErrorResponse.error = new AppError(['cost not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    

    if (bodyReq.status !== undefined && (Number(bodyReq.status) === 2 || Number(bodyReq.status) === 3)) {
        if (bodyReq.expiryDate == undefined || !bodyReq.expiryDate.trim()) {
            ErrorResponse.message = 'Something went wrong while assigning individual DID.';
            ErrorResponse.error = new AppError(['expiryDate not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }
    next();

}

async function validateUpdateStatus(req, res, next) {
    const bodyReq = req.body;
    
    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while status Approve/Reject Action.';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.updateId == undefined || !bodyReq.updateId.trim()) {
        ErrorResponse.message = 'Something went wrong while status Approve/Reject Action.';
        ErrorResponse.error = new AppError(['updateId not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.status == undefined ) {
        ErrorResponse.message = 'Something went wrong while status Approve/Reject Action.';
        ErrorResponse.error = new AppError(['status not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();

}

async function validateMapping(req, res, next) {
    const bodyReq = req.body;

    if (!req.is('application/json')) {
        ErrorResponse.message = 'Something went wrong while creating Numbers';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in application/json format'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.DID == undefined ) {
        ErrorResponse.message = 'Something went wrong while DID Mapping';
        ErrorResponse.error = new AppError(['DID not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.allocated_to == undefined) {
        ErrorResponse.message = 'Something went wrong while DID Mapping';
        ErrorResponse.error = new AppError(['allocated_to not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();

}

module.exports = {
    validateCreate,
    modifyNumberCreateBodyRequest,
    validateUploadNumbers,
    validateBulkUpdate,
    modifyNumberUpdateBodyRequest,
    isNumberExistInCollection,
    validateUpdate,
    validateDeleteRequest,
    upload: upload.single('phone_numbers'),
    saveFile,
    validateBulkAssignDID,
    validateIndividualAssignDID,
    validateUpdateStatus,
    validateMapping
}