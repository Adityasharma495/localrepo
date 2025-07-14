const { StatusCodes } = require("http-status-codes");
const {
  ContactGroupRepository,
  ContactGroupMemberRepository,
  UserJourneyRepository,
} = require("../../shared/c_repositories");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const {
  MODULE_LABEL,
  ACTION_LABEL,
} = require("../../shared/utils/common/constants");
const { Logger } = require("../../shared/config");

const contactGroupRepo = new ContactGroupRepository();
const contactGroupMembersRepo = new ContactGroupMemberRepository();
const userJourneyRepo = new UserJourneyRepository();

async function createContactGroup(req, res) {
  const bodyReq = req.body;
  try {
    bodyReq.created_by = req?.user?.id;
    const responseData = {};

    // Create ContactGroup with corrected payload
    const contactGroupData = await contactGroupRepo.create(bodyReq);
    responseData.contactGroup = contactGroupData;

    const userJourneyfields = {
      module_name: MODULE_LABEL.CONTACTGROUP,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id,
    };

    const userJourney = await userJourneyRepo.create(userJourneyfields);
    responseData.userJourney = userJourney;

    SuccessRespnose.data = responseData;
    SuccessRespnose.message = "Successfully created a new contactGroup";

    Logger.info(
      `ContactGroup -> created successfully: ${JSON.stringify(responseData)}`
    );

    return res.status(StatusCodes.CREATED).json(SuccessRespnose);
  } catch (error) {
    Logger.error(
      `ContactGroup -> unable to create contactGroup: ${JSON.stringify(
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

async function uploadMembers(req, res) {
  const bodyReq = req.body;
  const targetGroupId = req.params.id;
  const sourceGroupIds = bodyReq.groupIds;

  try {
    const allSourceMembers = [];
    for (const groupId of sourceGroupIds) {
      const members = await contactGroupMembersRepo.getUnderOneContactGroup(
        groupId
      );
      allSourceMembers.push(...members);
    }

    const existingTargetMembers =
      await contactGroupMembersRepo.getUnderOneContactGroup(targetGroupId);
    const existingPrimaryNumbers = new Set(
      existingTargetMembers.map(
        (member) => member.dataValues?.primary_number || member.primary_number
      )
    );

    const uniqueMembers = allSourceMembers.filter((member) => {
      const primaryNum =
        member.dataValues?.primary_number || member.primary_number;

      if (existingPrimaryNumbers.has(primaryNum)) {
        return false;
      }

      existingPrimaryNumbers.add(primaryNum);
      return true;
    });

    const newRecords = uniqueMembers.map((member) => {
      const {
        id,
        created_at,
        updated_at,
        contact_group_id,
        created_by,
        ...memberData
      } = member.dataValues || member;

      return {
        ...memberData,
        contact_group_id: targetGroupId,
        created_by: req?.user?.id,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    const result = await contactGroupMembersRepo.insertMany(newRecords);

    return res.status(StatusCodes.CREATED).json({
      message: "Members copied successfully",
      data: {
        totalCopied: result.length,
        fromGroups: sourceGroupIds,
        toGroup: targetGroupId,
        duplicateSkipped: allSourceMembers.length - uniqueMembers.length,
      },
    });
  } catch (error) {
    console.error("Error copying members:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to copy members",
      error: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const data = await contactGroupRepo.getAll(req.user.role, req.user.id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `ContactGroup -> unable to get contactGroup list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function get(req, res) {
  const id = req.params.id;

  try {
    const contactGroupData = await contactGroupRepo.get(id);
    if (contactGroupData.length == 0) {
      const error = new Error();
      error.name = "CastError";
      throw error;
    }
    SuccessRespnose.message = "Success";
    SuccessRespnose.data = contactGroupData;

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.error = error;
    if (error.name == "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      errorMsg = "ContactGroup not found";
    }
    ErrorResponse.message = errorMsg;

    Logger.error(
      `User -> unable to get ${id}, error: ${JSON.stringify(error)}`
    );

    return res.status(statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createContactGroup,
  getAll,
  get,
  uploadMembers,
};
