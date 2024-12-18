const { HandleFileSaveRepository } = require("../repositories");
const { SuccessRespnose, ErrorResponse } = require("../utils/common");
const HandleFileSaveRepo = new HandleFileSaveRepository();
const { StatusCodes } = require("http-status-codes");
async function SaveAudioFile(req,res)
{
    
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const {prompt_category,prompt_name} = req.body

    const data = {
        prompt_category:prompt_category,
        prompt_name:prompt_name,
    }
    
    const uploadData = {...data, prompt_url:req.file.path}
    try {
        const response = await HandleFileSaveRepo.create(uploadData)

        SuccessRespnose.data = response;
        SuccessRespnose.message = 'Successfully created Prompt';
        return res.status(StatusCodes.CREATED).json(SuccessRespnose);

    } catch (error) {
    let statusCode = error.statusCode;
    let errorMsg = error.message;
    if (error.name == "MongoServerError" || error.code == 11000) {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName == "DuplicateKey")
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
    }

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
    }
    
    
}

module.exports = {SaveAudioFile}