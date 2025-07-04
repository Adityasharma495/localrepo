const { MemberScheduleRepo, ScriptRepository, VoiceCampaignRepository } = require("../../shared/c_repositories")


const memberScheduleRepo = new MemberScheduleRepo()
const scriptRepo = new ScriptRepository();
const voiceCampaignRepo = new VoiceCampaignRepository();

async function CreateVoiceCampaign(req,res){

    const bodyReq = req.body
    const {member_schedule, script, ...campaignData} = bodyReq


try {
    
    // created and extracted member schedule id
    const createdMemberSchedule = await memberScheduleRepo.create(member_schedule)
    const member_schedule_id = createdMemberSchedule.id


    console.log("CREATED MEMBER SCHEDULE", createdMemberSchedule);
    // created and extracted scripts id
    const createdScript = await scriptRepo.create(script)
    const script_id = createdScript.id


    console.log("CREATED SCRIPT", createdScript);

    // create Voice Campaign

    const now = new Date();
    const findlCampaignData = {
        ...campaignData,
        script_id:script_id,
        memberschedule_id:member_schedule_id,
        created_at: now,
        updated_at: now
    }

    console.log("FINAL COMAPNI DATA", findlCampaignData);



    const createdVoiceCampaign = await voiceCampaignRepo.create(findlCampaignData) 

    
    console.log("CREATED VOICE CAMPIAGN DATA", createdVoiceCampaign);



} catch (error) {
    
}

}

module.exports={
    CreateVoiceCampaign
}