const { StatusCodes } = require("http-status-codes");
const {
  UserRepository,
  CallCentreRepository,
  TrunkRepository,
  NumbersRepository,
  DataCenterRepository,
  ServerManagementRepository,
  ModuleRepository,
  UserJourneyRepository,
  AclSettingsRepository,
  NumberFileListRepository,
  AgentRepository,
  AgentGroupRepository,
  ExtensionRepository,
  CreditsRepository,
  VoicePlansRepository,
  FlowJsonRepository,
  VoiceCampaignRepository,
  BreakRepository,
  ContactGroupRepository,
  ContactGroupMemberRepository,
} = require("../../shared/c_repositories");

const { Parser } = require("json2csv");
const { Logger } = require("../../shared/config");

async function exportData(req, res) {
  const { model } = req.params;

  const repositories = {
    Users: new UserRepository(),
    CallCentre: new CallCentreRepository(),
    Trunks: new TrunkRepository(),
    Numbers: new NumbersRepository(),
    IVR: new FlowJsonRepository(),
    DataCenter: new DataCenterRepository(),
    ServerManagement: new ServerManagementRepository(),
    Module: new ModuleRepository(),
    UserJourney: new UserJourneyRepository(),
    AclSetting: new AclSettingsRepository(),
    NumberFileList: new NumberFileListRepository(),
    Agent: new AgentRepository(),
    AgentGroup: new AgentGroupRepository(),
    Extension: new ExtensionRepository(),
    Credits: new CreditsRepository(),
    VoicePlan: new VoicePlansRepository(),
    Campaigns: new VoiceCampaignRepository(),
    Breaks: new BreakRepository(),
    Contact_Groups: new ContactGroupRepository(),
    Contact_Group_Members: new ContactGroupMemberRepository(),
  };

  try {
    if (!(model in repositories)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: `Unknown model: ${model}` });
    }

    const repo = repositories[model];
    const data = await repo.findAllData(req.user.role, req.user.id);

    if (!data || data.length === 0) {
      return res
        .status(StatusCodes.NO_CONTENT)
        .send(`No ${model} data available to export`);
    }

    const plainData = data.map((record) => record.dataValues);

    const fields = Object.keys(plainData[0]);
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(plainData);

    res.header("Content-Type", "text/csv");
    res.attachment(`${model}.csv`);
    res.data = csv;

    Logger.info(`Export List -> data exported successfully for ${model}`);

    return res.status(StatusCodes.OK).json({
      message: `${model} data exported successfully`,
      data: res.data,
    });
  } catch (err) {
    Logger.error(`Export Error -> ${err.message}`);
    return res
      .status(StatusCodes.SERVICE_UNAVAILABLE)
      .json({ error: err.message });
  }
}

module.exports = {
  exportData,
};
