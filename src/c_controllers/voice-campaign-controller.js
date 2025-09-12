const { MemberScheduleRepo, ScriptRepository, VoiceCampaignRepository, UserJourneyRepository, CampiagnConfigRepository,
  AgentConfigRepository, CampaignCliRepository, CampaignContactGroupRepository, WebhookRepository, SMSWebhookRepository,
  VoiceCampaignWebhookRepository , CampaignCallGroupRepository, CampaignScheduleRepository, VoiceCampaignLocationsRepository, UserGroupsRepository, VoiceCampaignGroupsRepository, UserRepository,
  ContactGroupMemberRepository, FlowJsonRepository} = require("../../shared/c_repositories")


const memberScheduleRepo = new MemberScheduleRepo()
const scriptRepo = new ScriptRepository();
const voiceCampaignRepo = new VoiceCampaignRepository();
const userJourneyRepo = new UserJourneyRepository();
const campiagnConfigRepo = new CampiagnConfigRepository();
const agentConfigRepo = new AgentConfigRepository();
const campaignCliRepo = new CampaignCliRepository();
const campaignContactGroupRepo = new CampaignContactGroupRepository();
const webhookRepository = new WebhookRepository();
const smswebhookRepository = new SMSWebhookRepository();
const voiceCampaignWebhookRepository = new VoiceCampaignWebhookRepository();
const campaignCallGroupRepo = new CampaignCallGroupRepository();
const campaignScheduleRepo = new CampaignScheduleRepository();
const voiceCampaignLocationsRepository = new VoiceCampaignLocationsRepository();
const userGroupsRepository = new UserGroupsRepository();
const voiceCampaignGroupsRepository = new VoiceCampaignGroupsRepository();
const userRepository = new UserRepository();
const contactGroupMemberRepo = new ContactGroupMemberRepository();
const flowJsonRepos = new FlowJsonRepository();

const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");
const { StatusCodes } = require("http-status-codes");
const { MODULE_LABEL, ACTION_LABEL } = require("../../shared/utils/common/constants");
const singlecallRedisClient = require("../../shared/config/redis-client-singlecall"); 
const {VOICE_CONTEXT} = require("../../shared/utils/common/constants");


async function CreateVoiceCampaign(req,res){
    const bodyReq = req.body
    const {member_schedule, script, ...campaignData} = bodyReq

try {
    const existingData = await voiceCampaignRepo.findOne({
      campaign_name: bodyReq.campaign_name.trim(),
      user_id: req.user.id,
    });
    
    if (existingData) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Campaign name already exists, please choose another name.",
      });
    }
   

    let script_id;
    // created and extracted scripts id
    if (bodyReq.scriptOption === "new") {
        script.created_by = req.user.id;
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

    //find total number of contacts
    const total_numbers =  await contactGroupMemberRepo.getTotalMembersByGroups(bodyReq.call_group)

    //context value
    let context
    if (bodyReq.template_id == 4) {
      const ivrDetail = await flowJsonRepos.get(bodyReq.ivr)
      if (ivrDetail.length > 0) {
        context= `${ivrDetail[0].flow_name}_${req.user.id}`
      }
    } else {
      context = VOICE_CONTEXT[Number(bodyReq.template_id)]
    }

    const findlCampaignData = {
      ...Object.fromEntries(
        Object.entries(campaignData).map(([key, value]) => [key, normalizeValue(value)])
      ),
      script_id: normalizeValue(script_id),
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
      total_nos: total_numbers,
      context: context
    };

    if (req?.user?.id) {
      const userData = await userRepository.get(req.user.id);
      if (userData) {
        findlCampaignData.call_centre_id = userData.callcenter_id;
        if (userData.created_by) {
          const parentData = await userRepository.get(userData.created_by);
          if (parentData.company_id) {
            findlCampaignData.company_id = parentData.company_id;
          }
        }
      }
    }

    const smsWebhookIds = [
      findlCampaignData.successSmsWebhook,
      findlCampaignData.failSmsWebhook,
      findlCampaignData.smsOnDtmf,
      findlCampaignData.smsOnPatchSuccess,
      findlCampaignData.smsOnPatchFailed,
    ].filter(Boolean);

    const smsEventsMap = {
      successSmsWebhook: "CALL_CONNECTED",
      failSmsWebhook: "CALL_FAILED",
      smsOnDtmf: "VALID_DTMF",
      smsOnPatchSuccess: "PATCH_CONNECTED",
      smsOnPatchFailed: "PATCH_FAILED",
    };

    const webhookIds = [findlCampaignData.webhook].filter(Boolean);
    const smsWebhooksData = await smswebhookRepository.findAllByIds(smsWebhookIds);
    const webhooksData = await webhookRepository.findAllByIds(webhookIds);

    const createdVoiceCampaign = await voiceCampaignRepo.create(findlCampaignData) 
    const campaignId = createdVoiceCampaign.campaign_id;
    const duration = findlCampaignData.duration || 0;
    const recordsToInsert = [];

    const smsWebhookEntries = [
      {
        id: findlCampaignData.successSmsWebhook,
        flag: "sendSmsOnSuccess",
        event: smsEventsMap.successSmsWebhook,
      },
      {
        id: findlCampaignData.failSmsWebhook,
        flag: "sendSmsOnFail",
        event: smsEventsMap.failSmsWebhook,
      },
      {
        id: findlCampaignData.smsOnDtmf,
        flag: "enableSmsOnDtmf",
        event: smsEventsMap.smsOnDtmf,
      },
      {
        id: findlCampaignData.smsOnPatchSuccess,
        flag: "enableSmsOnPatchSuccess",
        event: smsEventsMap.smsOnPatchSuccess,
      },
      {
        id: findlCampaignData.smsOnPatchFailed,
        flag: "enableSmsOnPatchFailed",
        event: smsEventsMap.smsOnPatchFailed,
      },
    ];
    for (const entry of smsWebhookEntries) {
      if (findlCampaignData[entry.flag] && entry.id) {
        const smsWebhook = smsWebhooksData.find((s) => s.id == entry.id);
        if (smsWebhook) {
          recordsToInsert.push({
            campaign_id: campaignId,
            sms_webhook_id: smsWebhook.id,
            url: smsWebhook.url,
            sms_text: smsWebhook.sms_text,
            payload: smsWebhook.payload,
            duration: entry.flag === "sendSmsOnSuccess" ? duration : 0,
            req_type: smsWebhook.request_type,
            event: entry.event,
          });
        }
      }
    }
    for (const webhook of webhooksData) {
      let req_type = "GET";
      if (webhook.event_id == 1) {
        req_type = "HANGUP";
      } else if (webhook.event_id == 2) {
        req_type = "DTMF";
      } else if (webhook.event_id == 3) {
        req_type = "CONNECTED_CALLS";
      }

      recordsToInsert.push({
        campaign_id: campaignId,
        webhook_id: webhook.id,
        url: webhook.url,
        duration: 0,
        req_type: req_type,
        event: req_type,
      });
    }

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
            call_group_id: queue.queueId,
            dtmf: queue.dtmf,
          }));

          // Insert into DB
          await campaignCallGroupRepo.bulkCreate(queueRecords);
        }
    }

    if (normalizeValue(bodyReq.selectedQueue)) {
      const params= {
            campaign_id: createdVoiceCampaign?.campaign_id,
            call_group_id: normalizeValue(bodyReq.selectedQueue),
            dtmf: null,
          }

          // Insert into DB
          await campaignCallGroupRepo.create(params);
    }

    // created entry in campaign Schedule
    await campaignScheduleRepo.create({...member_schedule, campaign_id: createdVoiceCampaign?.campaign_id})

    if (bodyReq.did && bodyReq.did.length > 0) {
      const didRecords = bodyReq.did.map(did => ({
        campaign_id: createdVoiceCampaign?.campaign_id,
        cli: did
      }));
      // Insert into DB
      await campaignCliRepo.create(didRecords);
    }


    if (bodyReq.call_group && bodyReq.call_group.length > 0) {
      const contactGroupRecords = bodyReq.call_group.map(call_group => ({
        campaign_id: createdVoiceCampaign?.campaign_id,
        contact_group_id: call_group
      }));
      // Insert into DB
      await campaignContactGroupRepo.create(contactGroupRecords);
    }

    for (const record of recordsToInsert) {
      await voiceCampaignWebhookRepository.create(record);
    }

    if (bodyReq.locations) {
      if (bodyReq?.locations?.length > 0) {
        const locationsData = bodyReq.locations.map(loc => ({
          campaign_id: campaignId,
          location_id: loc.id,
          location_name: loc.location_name,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await voiceCampaignLocationsRepository.insertMany(locationsData);
      }
    }

    const userGroups = await userGroupsRepository.getAll({ where: { user_id: req.user.id } });
    if (userGroups) {
      if (userGroups.length > 0) {
        const insertPayload = userGroups.map((ug) => ({
          group_id: ug.group_id,
          campaign_id: campaignId,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await voiceCampaignGroupsRepository.insertMany(insertPayload);
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

async function UpdateVoiceCampaign(req, res) {
  const id = req.params.id;
  const bodyReq = req.body;
  try {
    const data = await voiceCampaignRepo.update(id, bodyReq);
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    await userJourneyRepo.create({
      module_name: MODULE_LABEL.VOICE_CAMPAIGNS,
      action: ACTION_LABEL.EDIT,
      created_by: req?.user?.id
    });
    Logger.info(`Voice Campaign ${id} -> updated successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    console.log("error updating campaign", error);
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Voice Campaigns -> unable to update voice campaign, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function HandleSingleCall(req, res) {
  const bodyReq = req.body;

  try {
    if (!bodyReq.cli) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "cli not existed in payload",
      });
    }

    const cli = bodyReq.cli.toString().slice(-10);
    const servername = await voiceCampaignRepo.getServerNameByNumber(cli);

    if (!servername) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "ServerName Not found",
      });
    }

    bodyReq.trunk = servername.server_name;
    const redisKey = `base_${servername.server_name}`;

    // Push the object into Redis list
    await singlecallRedisClient.lPush(redisKey, JSON.stringify(bodyReq));

    // Get the count of objects in the list
    const count = await singlecallRedisClient.lLen(redisKey);

    return res.status(StatusCodes.OK).json({
      message: "Pushed to Redis successfully",
      redisKey,
      count,
    });
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `SingleCall -> Error while handling single call: ${JSON.stringify(error)}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


module.exports={
    CreateVoiceCampaign,
    getCampaigns,
    getOne,
    UpdateVoiceCampaign,
    HandleSingleCall
}