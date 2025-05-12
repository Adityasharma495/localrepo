const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../../shared/utils/common');
const AppError = require('../../shared/utils/errors/app-error');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function validateCreatePrompts(req, res, next) {
    const bodyReq = Object.assign({}, req.body);
    if (!req.is('multipart/form-data')) {
        ErrorResponse.message = 'Something went wrong while creating prompts';
        ErrorResponse.error = new AppError(['Invalid content type, incoming request must be in multipart/form-data format'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    } 
    else if (bodyReq.prompt_category == undefined || !bodyReq.prompt_category.trim()) {
        ErrorResponse.message = 'Something went wrong while creating creating prompts';
        ErrorResponse.error = new AppError(['prompt_category not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    else if (bodyReq.prompt_name == undefined || !bodyReq.prompt_name.trim()) {
        ErrorResponse.message = 'Something went wrong while creating creating prompts';
        ErrorResponse.error = new AppError(['prompt_name not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    else if (bodyReq.language == undefined || !bodyReq.language.trim()) {
        ErrorResponse.message = 'Something went wrong while creating creating prompts';
        ErrorResponse.error = new AppError(['language not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }

    const file = req.file;
    const allowedFileTypes = ['.wav', '.mp3'];
    
    // Check if the file is present
    if (!file) {
        ErrorResponse.message = 'File is missing';
        ErrorResponse.error = new AppError(['No file uploaded'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    
    // Check the file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
if (!allowedFileTypes.includes(fileExtension)) {
    ErrorResponse.message = 'Invalid file type';
    ErrorResponse.error = new AppError(
        [`Invalid file type, only ${allowedFileTypes.join(' or ')} files are allowed`],
        StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
}
    req.folder = `../../temp/voice/${req?.user?.id.toString()}/prompts/${bodyReq.language}`
    next();
}

function saveFile(req, res, next) {
    const file = req.file;
    const folder = req.folder;
    const destFolder = path.join(__dirname, folder);
    const originalFileName = path.basename(file.originalname);

    let fileAlias;
    if (file.mimetype === 'audio/mpeg') {
        fileAlias = file.originalname.replace(/\.mp3$/, '.wav');
    } else {
        fileAlias = file.originalname;
    }

    req.fileAlias = fileAlias;
        
    const filePath = path.join(destFolder, originalFileName);
    req.file.path = filePath; 
    req.file.name = originalFileName

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


module.exports = {
    validateCreatePrompts,
    upload: upload.single('file'),
    saveFile,
}