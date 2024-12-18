const express = require('express')
const router = express.Router();
const {VoiceCategory} = require('../../db')
const {SuccessRespnose , ErrorResponse , Authentication } = require("../../utils/common");
const { StatusCodes } = require("http-status-codes");

router.get('/',async(req,res)=>{
   const data = await VoiceCategory.findOne();
   try {
         SuccessRespnose.data = data;
         SuccessRespnose.message = "Fetched Voice Categories";
         return res.status(StatusCodes.CREATED).json(SuccessRespnose);
   } catch (error) {
    const errorMsg = "Unable to fetch Categories";
    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse); 
   }
})
module.exports = router