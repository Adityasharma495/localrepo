const { StatusCodes } = require("http-status-codes");
const {
  ContactGroupMemberRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");
const csv = require("csv-parser");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const {
  MODULE_LABEL,
  ACTION_LABEL,
} = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");
const fs = require("fs");

const contactGroupMemberRepo = new ContactGroupMemberRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createContactGroupMember(req, res) {
  const bodyReq = req.body;
  try {
    bodyReq.created_by = req.user.id;
    const responseData = {};

    // Create contactGroupMember with corrected payload
    const contactGroupMemberData = await contactGroupMemberRepo.create(bodyReq);
    responseData.contactGroupMember = contactGroupMemberData;

    const userJourneyfields = {
      module_name: MODULE_LABEL.CONTACTGROUPMEMBER,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new contactGroupMember";

    Logger.info(
      `ContactGroupMember -> created successfully: ${JSON.stringify(
        responseData
      )}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `ContactGroupMember -> unable to create contactGroupMember: ${JSON.stringify(
        bodyReq
      )} error: ${JSON.stringify(error)}`
    );

    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function getAll(req, res) {
  try {
    const data = await contactGroupMemberRepo.getAll(
      req.user.role,
      req.user.id
    );
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `ContactGroupMember -> unable to get contactGroupMember list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getUnderOneContactGroup(req, res) {
  try {
    const id = req.params.id;
    const data = await contactGroupMemberRepo.getUnderOneContactGroup(id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `ContactGroupMember -> unable to get contactGroupMember list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function get(req, res) {
  const id = req.params.id;

  try {
    const contactGroupMemberData = await contactGroupMemberRepo.get(id);
    if (contactGroupMemberData.length == 0) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = contactGroupMemberData;

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "ContactGroupMember not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `User -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function deleteContactGroupMember(req, res) {
  const id = req.body.id;

  try {
    const response = await contactGroupMemberRepo.delete(id);

    const userJourneyfields = {
      module_name: MODULE_LABEL.CONTACTGROUPMEMBER,
      action: ACTION_LABEL.DELETE,
      created_by: req?.user?.id,
    };

    await userJourneyRepo.create(userJourneyfields);
    SuccessRespnose.message = "Deleted successfully!";
    SuccessRespnose.data = response;

    Logger.info(`ContactGroupMember -> ${id} deleted successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "ContactGroupMember not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `ContactGroupMember -> unable to delete contactGroupMember: ${id}, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function updateContactGroupMember(req, res) {
  const uid = req.params.id;
  const bodyReq = req.body;

  try {
    const responseData = {};

    const contactGroupMemberData = await contactGroupMemberRepo.update(
      uid,
      bodyReq
    );
    if (!contactGroupMemberData) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }

    responseData.contactGroupMember = contactGroupMemberData;

    const userJourneyfields = {
      module_name: MODULE_LABEL.CONTACTGROUPMEMBER,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.message = "Updated successfully!";
    SuccessRespnose.data = responseData;

    Logger.info(`ContactGroupMember -> ${uid} updated successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message || "Something went wrong";

    if (error.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "ContactGroupMember not found";
    } else if (error.name === "MongoServerError") {
      statusCode = StatusCodes.BAD_REQUEST;
      if (error.codeName === "DuplicateKey") {
        errorMsg = `Duplicate key, record already exists for ${error.keyValue.name}`;
      }
    }

    ErrorResponse.message = errorMsg;

    Logger.error(
      `ContactGroupMember-> unable to update contactGroupMember: ${uid}, data: ${JSON.stringify(
        bodyReq
      )}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

async function uploadMembersData(req, res) {
  const dest = req.file.path;
  try {
    const validatePhoneNumber = (number) => {
      if (!number) return null;
      const cleaned = number.toString().replace(/\D/g, "");
      if (cleaned.length !== 10) {
        throw new Error(
          `Phone number must be 10 digits, got ${cleaned.length}`
        );
      }
      return cleaned;
    };

    if (!fs.existsSync(dest)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "File not found",
        error: new Error("File not found"),
      });
    }

    const records = [];
    const dataPromises = [];
    let headersSent = false;
    let duplicateCount = 0;
    let invalidCount = 0;

    fs.createReadStream(dest)
      .pipe(csv())
      .on("data", (row) => {
        const dataPromise = (async () => {
          try {
            const contactGroupId = row["Contact Group Id"] || null;
            if (!contactGroupId) {
              throw new Error("Contact Group Id is required");
            }
            const existingContacts =
              await contactGroupMemberRepo.getUnderOneContactGroup(
                contactGroupId
              );
            const existingNumbers = existingContacts.map(
              (contact) => contact.primary_number
            );

            const primaryNumber = validatePhoneNumber(row["Primary Number"]);
            if (!primaryNumber) {
              invalidCount++;
              throw new Error(
                "Primary number is required and must be 10 digits"
              );
            }

            if (existingNumbers.includes(primaryNumber)) {
              duplicateCount++;
              return;
            }

            const transformedRecord = {
              first_name: row["First Name"] || null,
              last_name: row["Last Name"] || null,
              state: row["State"] || null,
              city: row["City"] || null,
              country: row["Country"] || null,
              company: row["Company"] || null,
              street: row["Street"] || null,
              primary_number: primaryNumber,
              alt1_number: row["Alternate Number 1(Optional)"]
                ? validatePhoneNumber(row["Alternate Number 1(Optional)"])
                : null,
              alt2_number: row["Alternate Number 2(Optional)"]
                ? validatePhoneNumber(row["Alternate Number 2(Optional)"])
                : null,
              contact_group_id: contactGroupId,
              created_by: req.user.id,
              created_at: new Date(),
              updated_at: new Date(),
            };

            records.push(transformedRecord);
          } catch (error) {
            console.error(
              `Error processing row: ${JSON.stringify(row)}`,
              error
            );
          }
        })();

        dataPromises.push(dataPromise);
      })
      .on("end", async () => {
        await Promise.all(dataPromises);

        try {
          if (records.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
              message: "No valid contacts to upload",
              details: {
                duplicates: duplicateCount,
                invalid: invalidCount,
              },
            });
          }

          const result = await contactGroupMemberRepo.insertMany(records);

          if (!headersSent) {
            const successResponse = {
              message: `Contacts processed successfully`,
              data: {
                added: records.length,
                duplicates: duplicateCount,
                invalid: invalidCount,
                details: result,
              },
            };
            headersSent = true;
            return res.status(StatusCodes.CREATED).json(successResponse);
          }
        } catch (error) {
          if (!headersSent) {
            const errorResponse = {
              message: "Error while saving contacts to the database",
              error: error.message,
              details: {
                duplicates: duplicateCount,
                invalid: invalidCount,
              },
            };
            headersSent = true;
            return res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json(errorResponse);
          }
        }
      })
      .on("error", (error) => {
        if (!headersSent) {
          const errorResponse = {
            message: "Error while processing the file",
            error: error.message,
          };
          headersSent = true;
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse);
        }
      });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error while processing the file",
      error: error.message,
    });
  }
}

module.exports = {
  createContactGroupMember,
  getAll,
  get,
  deleteContactGroupMember,
  updateContactGroupMember,
  getUnderOneContactGroup,
  uploadMembersData,
};
