const { StatusCodes } = require("http-status-codes");
const { ErrorResponse } = require("../../shared/utils/common");
const AppError = require("../../shared/utils/errors/app-error");
const { constants } = require("../../shared/utils/common");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Readable } = require("stream");
const csvParser = require("csv-parser");

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function validateUploadData(req, res, next) {
  const bodyReq = Object.assign({}, req.body);
  if (!req.is("multipart/form-data")) {
    ErrorResponse.message = "Something went wrong while uploading numbers";
    ErrorResponse.error = new AppError(
      [
        "Invalid content type, incoming request must be in multipart/form-data format",
      ],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  const file = req.file;
  const allowedFileType = ".csv";

  // Check if the file is present
  if (!file) {
    ErrorResponse.message = "File is missing";
    ErrorResponse.error = new AppError(
      ["No file uploaded"],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  // Check the file extension
  const fileExtension = path.extname(file.originalname);
  if (fileExtension !== allowedFileType) {
    ErrorResponse.message = "Invalid file type";
    ErrorResponse.error = new AppError(
      [`Invalid file type, only ${allowedFileType} files are allowed`],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  // Validate CSV columns
  try {
    await validateCsvColumns(
      file.buffer,
      constants.CONTACT_GROUP_CONSTANTS.UPLOAD_CONTACT_GROUP_MEMBERS
    );
  } catch (error) {
    console.log("error middlewae", error);
    ErrorResponse.message = "Issue with File Validation";
    ErrorResponse.error = new AppError(
      [error.message],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  req.folder = `../../assets/contact_group_members/${req?.user?.id.toString()}`;
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
  const formattedDate = indiaTime.toISOString().replace(/:/g, "-");
  const originalFileName = path.basename(file.originalname);
  const newFileName = `${formattedDate}_${originalFileName}`;

  const filePath = path.join(destFolder, newFileName);
  req.file.path = filePath;
  req.file.name = newFileName;

  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  fs.writeFile(filePath, file.buffer, (err) => {
    if (err) {
      ErrorResponse.message = "Error saving file";
      ErrorResponse.error = new Error("Error saving file to disk");
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
      .on("headers", (headers) => {
        headers.forEach((header) => columns.add(header));
        headersChecked = true;

        const missingColumns = REQUIRED_COLUMNS.filter(
          (column) => !columns.has(column)
        );
        if (missingColumns.length > 0) {
          readableStream.destroy();
          reject(new Error(`Missing columns: ${missingColumns.join(", ")}`));
        }
      })
      .on("data", () => {
        dataRowProcessed = true;
        if (headersChecked) {
          readableStream.destroy();
          resolve();
        }
      })
      .on("end", () => {
        if (headersChecked && !dataRowProcessed) {
          reject(new Error("Uploaded file is empty"));
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

module.exports = {
  validateUploadData,
  upload: upload.single("members_data"),
  saveFile,
};
