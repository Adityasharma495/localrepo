const express = require("express");
const router = express.Router();
const { VoiceCategory } = require("../../../shared/c_db");
const {
  SuccessRespnose,
  ErrorResponse,
  ResponseFormatter,
} = require("../../../shared/utils/common");
const { StatusCodes } = require("http-status-codes");

router.get("/", async (req, res) => {
  try {
    const data = await VoiceCategory.findOne();

    if (!data) {
      SuccessRespnose.data = [];
      SuccessRespnose.message = "No Voice Categories found";
    } else {
      const plainData = data.toJSON();
      SuccessRespnose.data = plainData
      SuccessRespnose.message = "Fetched Voice Categories";
    }

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    const errorMsg = "Unable to fetch Categories";
    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
});

module.exports = router;
