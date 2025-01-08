const { StatusCodes } = require("http-status-codes");
const { UserRepository, CallCentreRepository, TrunksRepository, NumbersRepository, IVRRepository,
  DataCenterRepository, ServerManagementRepository,ModuleRepository,UserJourneyRepository,AclSettingRepository,NumberFileListRepository,
 AgentRepository, AgentGroupRepository, ExtentionRepository} = require("../repositories");
const { Parser } = require('json2csv');

async function exportData(req, res) {
    const { model } = req.params;

    const repositories = {
      Users: new UserRepository(),
      CallCentre: new CallCentreRepository(),
      Trunks: new TrunksRepository(),
      Numbers: new NumbersRepository(),
      IVR: new IVRRepository(),
      DataCenter: new DataCenterRepository(),
      ServerManagement: new ServerManagementRepository(),
      Module: new ModuleRepository(),
      UserJourney: new UserJourneyRepository(),
      AclSetting: new AclSettingRepository(),
      NumberFileList: new NumberFileListRepository(),
      Agent: new AgentRepository(),
      AgentGroup: new AgentGroupRepository(),
      Extension: new ExtentionRepository()
    };
  
    try {
      if (!(model in repositories)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: `Unknown model: ${model}` });
      }
  
      const repo = repositories[model];
      const data = await repo.findAllData();
  
      if (!data || data.length === 0) {
        return res.status(StatusCodes.NO_CONTENT).send(`No ${model} data available to export`);
      }
  
      const fields = Object.keys(data[0]);
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(data);
  
      res.header('Content-Type', 'text/csv');
      res.attachment(`${model}.csv`);
      res.data = csv;
  
      return res.status(StatusCodes.OK).json({
        message: `${model} data exported successfully`,
        data: res.data,
      });
    } catch (err) {
      console.error('Error exporting data:', err);
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ error: err.message });
    }
}


module.exports = {
    exportData
};
