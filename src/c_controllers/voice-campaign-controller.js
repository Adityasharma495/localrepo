const { MemberScheduleRepo, ScriptRepository, VoiceCampaignRepository, UserJourneyRepository } = require("../../shared/c_repositories")


const memberScheduleRepo = new MemberScheduleRepo()
const scriptRepo = new ScriptRepository();
const voiceCampaignRepo = new VoiceCampaignRepository();
const userJourneyRepo = new UserJourneyRepository();
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");
const { StatusCodes } = require("http-status-codes");
const { MODULE_LABEL, ACTION_LABEL } = require("../../shared/utils/common/constants");

async function CreateVoiceCampaign(req,res){

    const bodyReq = req.body
    const {member_schedule, script, ...campaignData} = bodyReq


try {
    
    // created and extracted member schedule id
    const createdMemberSchedule = await memberScheduleRepo.create(member_schedule)
    const member_schedule_id = createdMemberSchedule.id


    // console.log("CREATED MEMBER SCHEDULE", createdMemberSchedule);
    let script_id;
    // created and extracted scripts id
    if (bodyReq.scriptOption === "new") {
        const createdScript = await scriptRepo.create(script)
        script_id = createdScript.id
    } else if (bodyReq.scriptOption === "existing") {
        script_id = bodyReq.selectedScript;
    } else {
        script_id = null;
    }

    let is_recording = 0;
    if (bodyReq.callRecording === "do_not_record") {
        is_recording = 0
    } else {
        is_recording = 1;
    }

    let agentsData = [];
    if (bodyReq.agentAssignment === "all") {
        agentsData = bodyReq.selectedAgents;
    } else if(bodyReq.agentAssignment === "agents") {
        agentsData = [bodyReq.selectedAgents];
    } else {
        agentsData = [];
    }
    


    // console.log("CREATED SCRIPT ID", script_id);

    // create Voice Campaign

    const now = new Date();
    const findlCampaignData = {
        ...campaignData,
        script_id:script_id,
        memberschedule_id:member_schedule_id,
        created_at: now,
        updated_at: now,
        user_id: req.user.id,
        schedule_date: now,
        is_recording: is_recording,
        agents: agentsData,
        retry_interval: bodyReq.timeBetweenCalls,
        time_between_call: bodyReq.timeBetweenCalls,
        start_hours: bodyReq.startHour,
        end_hours: bodyReq.endHour,
        queue: bodyReq.selectedQueue || null,
    }

    // console.log("FINAL COMAPNI DATA", findlCampaignData);



    const createdVoiceCampaign = await voiceCampaignRepo.create(findlCampaignData) 

    
    // console.log("CREATED VOICE CAMPIAGN DATA", createdVoiceCampaign);
    SuccessRespnose.data = createdVoiceCampaign;
    SuccessRespnose.message = "Successfully created a new Voice Plan";

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.VOICE_CAMPAIGNS,
      action: ACTION_LABEL.ADD,
      created_by: req?.user?.id
    });

    Logger.info(`Voice Campaign -> created successfully`);
    return res.status(StatusCodes.CREATED).json(SuccessRespnose);



} catch (error) {
    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMsg = error.message;

    ErrorResponse.message = errorMsg;
    ErrorResponse.error = error;

    return res.status(statusCode).json(ErrorResponse);
}

}

async function getCampaigns(req, res) {
  const agent_id = req?.query?.agent_id || null;
  try {
    const data = await voiceCampaignRepo.getAll(req.user.role, req.user.id, agent_id);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log("error", error);
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Voice Campaigns -> unable to get voice campaigns list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function getOne(req, res) {
  const id = req.params.id;
  try {
    const data = await voiceCampaignRepo.findOne({ campaign_id: id });
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log("error", error);
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Voice Campaigns -> unable to get voice campaign, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports={
    CreateVoiceCampaign,
    getCampaigns,
    getOne,
}