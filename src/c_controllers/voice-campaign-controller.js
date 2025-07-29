const { MemberScheduleRepo, ScriptRepository, VoiceCampaignRepository, UserJourneyRepository, CampiagnConfigRepository, AgentConfigRepository } = require("../../shared/c_repositories")


const memberScheduleRepo = new MemberScheduleRepo()
const scriptRepo = new ScriptRepository();
const voiceCampaignRepo = new VoiceCampaignRepository();
const userJourneyRepo = new UserJourneyRepository();
const campiagnConfigRepo = new CampiagnConfigRepository();
const agentConfigRepo = new AgentConfigRepository();
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");
const { StatusCodes } = require("http-status-codes");
const { MODULE_LABEL, ACTION_LABEL } = require("../../shared/utils/common/constants");

async function CreateVoiceCampaign(req,res){
    const bodyReq = req.body
    // console.log('bodyReq', bodyReq)
    // process.exit(0)
    const {member_schedule, script, ...campaignData} = bodyReq

try {
    
    // created and extracted member schedule id
    const createdMemberSchedule = await memberScheduleRepo.create(member_schedule)
    const member_schedule_id = createdMemberSchedule.id

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

    // create Voice Campaign
    const now = new Date();
    function normalizeValue(value) {
      return value === "" ? null : value;
    }

    const findlCampaignData = {
      ...Object.fromEntries(
        Object.entries(campaignData).map(([key, value]) => [key, normalizeValue(value)])
      ),
      script_id: normalizeValue(script_id),
      memberschedule_id: normalizeValue(member_schedule_id),
      created_at: now,
      updated_at: now,
      user_id: req.user.id,
      schedule_date: now,
      is_recording: is_recording,
      agents: agentsData,
      retry_interval: normalizeValue(bodyReq.timeBetweenCalls),
      time_between_call: normalizeValue(bodyReq.timeBetweenCalls),
      start_hours: normalizeValue(bodyReq.startHour),
      end_hours: normalizeValue(bodyReq.endHour),
      queue: normalizeValue(bodyReq.selectedQueue),
    };

    const createdVoiceCampaign = await voiceCampaignRepo.create(findlCampaignData) 
    if (bodyReq?.template_id == 1) {
      await campiagnConfigRepo.create({
        name: 'welcome',
        value: bodyReq?.voice_file,
        campaign_id: createdVoiceCampaign?.campaign_id,
        dtmf: null,
        created_by: req.user.id
      })
    } 

    if (bodyReq?.template_id == 2 || bodyReq?.template_id == 3) {
      const fileMappings = {
        welcome_file: 'welcome',
        no_input_file: 'noinput',
        wrong_input_file: 'wronginput',
        thanks_file: 'thanks',
        no_agent_file: 'noagent'
      };

      const configsToInsert = [];

      for (const [key, fileData] of Object.entries(bodyReq)) {
        if (
          fileMappings[key] &&
          fileData.enabled === true &&
          fileData.selected && fileData.selected.trim() !== ""
        ) {
          configsToInsert.push({
            name: fileMappings[key],
            value: fileData.selected,
            campaign_id: createdVoiceCampaign?.campaign_id,
            dtmf: bodyReq?.dtmf,
            created_by: req.user.id
          });
        }
      }

      if (bodyReq?.menu_voice_file) {
        configsToInsert.push({
          name: 'menu',
          value: bodyReq?.menu_voice_file,
          campaign_id: createdVoiceCampaign?.campaign_id,
          dtmf: bodyReq?.dtmf,
          created_by: req.user.id
        });
      }


      // Insert if there are valid records
      if (configsToInsert.length > 0) {
        await campiagnConfigRepo.bulkCreate(configsToInsert);
      }

    } 
    
    if (bodyReq?.template_id == 3) {
        if (bodyReq.assignedQueues && bodyReq.assignedQueues.length > 0) {
          const queueRecords = bodyReq.assignedQueues.map(queue => ({
            campaign_id: createdVoiceCampaign?.campaign_id,
            agent_group: queue.queueId,
            dtmf: queue.dtmf,
            created_by: req?.user?.id
          }));

          // Insert into DB
          await agentConfigRepo.bulkCreate(queueRecords);
        }
    }
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
  console.log(error)
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