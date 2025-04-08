const express = require("express");
const router = express.Router();
const { VoiceCategory } = require("../../c_db");
const {
  SuccessRespnose,
  ErrorResponse,
  ResponseFormatter,
} = require("../../utils/common");
const { StatusCodes } = require("http-status-codes");
const version = process.env.API_V || "1";

router.get("/", async (req, res) => {
  try {
    const data = await VoiceCategory.findOne();

    if (!data) {
      SuccessRespnose.data = [];
      SuccessRespnose.message = "No Voice Categories found";
    } else {
      const plainData = data.toJSON();
      SuccessRespnose.data = ResponseFormatter.formatResponseIds(
        plainData,
        version
      );
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
