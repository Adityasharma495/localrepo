const { StatusCodes } = require("http-status-codes");
const {
  SuccessRespnose,
  ErrorResponse,
} = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");
const { IncomingSummaryRepository, AgentRepository } = require("../../shared/c_repositories");
const incomingSummaryRepo = new IncomingSummaryRepository();

const { constants } = require("../../shared/utils/common");

const agentRepository = new AgentRepository();

const { OutboundReportJanuaryW1Repository,OutboundReportJanuaryW2Repository,OutboundReportJanuaryW3Repository,OutboundReportJanuaryW4Repository,
  OutboundReportFebruaryW1Repository,OutboundReportFebruaryW2Repository,OutboundReportFebruaryW3Repository,OutboundReportFebruaryW4Repository,
  OutboundReportMarchW1Repository,OutboundReportMarchW2Repository,OutboundReportMarchW3Repository,OutboundReportMarchW4Repository,
  OutboundReportAprilW1Repository,OutboundReportAprilW2Repository,OutboundReportAprilW3Repository,OutboundReportAprilW4Repository,
  OutboundReportMayW1Repository,OutboundReportMayW2Repository,OutboundReportMayW3Repository,OutboundReportMayW4Repository,
  OutboundReportJuneW1Repository,OutboundReportJuneW2Repository,OutboundReportJuneW3Repository,OutboundReportJuneW4Repository,
  OutboundReportJulyW1Repository,OutboundReportJulyW2Repository,OutboundReportJulyW3Repository,OutboundReportJulyW4Repository,
  OutboundReportAugustW1Repository,OutboundReportAugustW2Repository,OutboundReportAugustW3Repository,OutboundReportAugustW4Repository,
  OutboundReportSeptemberW1Repository,OutboundReportSeptemberW2Repository,OutboundReportSeptemberW3Repository,OutboundReportSeptemberW4Repository,
  OutboundReportOctoberW1Repository,OutboundReportOctoberW2Repository,OutboundReportOctoberW3Repository,OutboundReportOctoberW4Repository,
  OutboundReportNovemberW1Repository,OutboundReportNovemberW2Repository,OutboundReportNovemberW3Repository,OutboundReportNovemberW4Repository,
  OutboundReportDecemberW1Repository,OutboundReportDecemberW2Repository,OutboundReportDecemberW3Repository,OutboundReportDecemberW4Repository, } = require("../../shared/c_repositories");

const outboundReport1W1Repo = new OutboundReportJanuaryW1Repository();
const outboundReport1W2Repo = new OutboundReportJanuaryW2Repository();
const outboundReport1W3Repo = new OutboundReportJanuaryW3Repository();
const outboundReport1W4Repo = new OutboundReportJanuaryW4Repository();

const outboundReport2W1Repo = new OutboundReportFebruaryW1Repository();
const outboundReport2W2Repo = new OutboundReportFebruaryW2Repository();
const outboundReport2W3Repo = new OutboundReportFebruaryW3Repository();
const outboundReport2W4Repo = new OutboundReportFebruaryW4Repository();

const outboundReport3W1Repo = new OutboundReportMarchW1Repository();
const outboundReport3W2Repo = new OutboundReportMarchW2Repository();
const outboundReport3W3Repo = new OutboundReportMarchW3Repository();
const outboundReport3W4Repo = new OutboundReportMarchW4Repository();

const outboundReport4W1Repo = new OutboundReportAprilW1Repository();
const outboundReport4W2Repo = new OutboundReportAprilW2Repository();
const outboundReport4W3Repo = new OutboundReportAprilW3Repository();
const outboundReport4W4Repo = new OutboundReportAprilW4Repository();

const outboundReport5W1Repo = new OutboundReportMayW1Repository();
const outboundReport5W2Repo = new OutboundReportMayW2Repository();
const outboundReport5W3Repo = new OutboundReportMayW3Repository();
const outboundReport5W4Repo = new OutboundReportMayW4Repository();

const outboundReport6W1Repo = new OutboundReportJuneW1Repository();
const outboundReport6W2Repo = new OutboundReportJuneW2Repository();
const outboundReport6W3Repo = new OutboundReportJuneW3Repository();
const outboundReport6W4Repo = new OutboundReportJuneW4Repository();

const outboundReport7W1Repo = new OutboundReportJulyW1Repository();
const outboundReport7W2Repo = new OutboundReportJulyW2Repository();
const outboundReport7W3Repo = new OutboundReportJulyW3Repository();
const outboundReport7W4Repo = new OutboundReportJulyW4Repository();

const outboundReport8W1Repo = new OutboundReportAugustW1Repository();
const outboundReport8W2Repo = new OutboundReportAugustW2Repository();
const outboundReport8W3Repo = new OutboundReportAugustW3Repository();
const outboundReport8W4Repo = new OutboundReportAugustW4Repository();

const outboundReport9W1Repo = new OutboundReportSeptemberW1Repository();
const outboundReport9W2Repo = new OutboundReportSeptemberW2Repository();
const outboundReport9W3Repo = new OutboundReportSeptemberW3Repository();
const outboundReport9W4Repo = new OutboundReportSeptemberW4Repository();

const outboundReport10W1Repo = new OutboundReportOctoberW1Repository();
const outboundReport10W2Repo = new OutboundReportOctoberW2Repository();
const outboundReport10W3Repo = new OutboundReportOctoberW3Repository();
const outboundReport10W4Repo = new OutboundReportOctoberW4Repository();

const outboundReport11W1Repo = new OutboundReportNovemberW1Repository();
const outboundReport11W2Repo = new OutboundReportNovemberW2Repository();
const outboundReport11W3Repo = new OutboundReportNovemberW3Repository();
const outboundReport11W4Repo = new OutboundReportNovemberW4Repository();

const outboundReport12W1Repo = new OutboundReportDecemberW1Repository();
const outboundReport12W2Repo = new OutboundReportDecemberW2Repository();
const outboundReport12W3Repo = new OutboundReportDecemberW3Repository();
const outboundReport12W4Repo = new OutboundReportDecemberW4Repository();

const repos = [
        outboundReport1W1Repo, outboundReport1W2Repo, outboundReport1W3Repo, outboundReport1W4Repo,
        outboundReport2W1Repo, outboundReport2W2Repo, outboundReport2W3Repo, outboundReport2W4Repo,
        outboundReport3W1Repo, outboundReport3W2Repo, outboundReport3W3Repo, outboundReport3W4Repo,
        outboundReport4W1Repo, outboundReport4W2Repo, outboundReport4W3Repo, outboundReport4W4Repo,
        outboundReport5W1Repo, outboundReport5W2Repo, outboundReport5W3Repo, outboundReport5W4Repo,
        outboundReport6W1Repo, outboundReport6W2Repo, outboundReport6W3Repo, outboundReport6W4Repo,
        outboundReport7W1Repo, outboundReport7W2Repo, outboundReport7W3Repo, outboundReport7W4Repo,
        outboundReport8W1Repo, outboundReport8W2Repo, outboundReport8W3Repo, outboundReport8W4Repo,
        outboundReport9W1Repo, outboundReport9W2Repo, outboundReport9W3Repo, outboundReport9W4Repo,
        outboundReport10W1Repo, outboundReport10W2Repo, outboundReport10W3Repo, outboundReport10W4Repo,
        outboundReport11W1Repo, outboundReport11W2Repo, outboundReport11W3Repo, outboundReport11W4Repo,
        outboundReport12W1Repo, outboundReport12W2Repo, outboundReport12W3Repo, outboundReport12W4Repo
];

async function getAll(req, res) {
  try {

    let data;
    if (req?.user?.role !== constants.USERS_ROLE.CALLCENTRE_AGENT) {
      
      data = await incomingSummaryRepo.getAll(req.user.role, req.user.id);
    } else {
      const agent = await agentRepository.findOne({ agent_name: req?.user?.username });
  if (!agent) return;

  const outboundResults = await Promise.all(
    repos.map(repo =>
      repo.getAllData({ where: { callee_number: agent.agent_number } })
    )
  );


  const outboundAllData = outboundResults.flat();

  const groupedOutbound = outboundAllData.reduce((acc, row) => {
    const scheduleDate = row.start_time
      ? new Date(row.start_time).toISOString().split("T")[0] 
      : "Unknown Date";

    const hasConnectedCall = !!Number(row.billing_duration);

    if (!acc[scheduleDate]) {
      acc[scheduleDate] = {
        did: row.callee_number,
        schedule_date: scheduleDate,
        nos_processed: 1,
        connected_calls: hasConnectedCall ? 1 : 0,
        sms_count: Number(row.sms_count) || 0,
        billing_duration: Number(row.billing_duration) || 0,
        dtmf_count: Number(row.dtmf_count) || 0,
        retry_count: Number(row.retry_count) || 0,
        webhook_count: Number(row.webhook_count) || 0,
        user_id: row.user_id,
        agent_number: row.agent_number
      };
    } else {
      acc[scheduleDate].nos_processed += 1;
      if (hasConnectedCall) {
        acc[scheduleDate].connected_calls += 1;
      }
      acc[scheduleDate].sms_count += Number(row.sms_count) || 0;
      acc[scheduleDate].billing_duration += Number(row.billing_duration) || 0;
      acc[scheduleDate].dtmf_count += Number(row.dtmf_count) || 0;
      acc[scheduleDate].retry_count += Number(row.retry_count) || 0;
      acc[scheduleDate].webhook_count += Number(row.webhook_count) || 0;
    }

    return acc;
  }, {});

  data = Object.values(groupedOutbound);
    }
    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(`Incoming Summary -> recieved all successfully`);

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Incoming Summary -> unable to get Incoming Summary list, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


async function getByDateRange(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "startDate and endDate are required in query params",
      });
    }
    
    const data = await incomingSummaryRepo.getByDateRange(
      req.user.role,
      req.user.id,
      startDate,
      endDate
    );

    SuccessRespnose.data = data;
    SuccessRespnose.message = "Success";

    Logger.info(
      `Incoming Summary -> retrieved data for range ${startDate} to ${endDate}`
    );

    return res.status(StatusCodes.OK).json(SuccessRespnose);
  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;

    Logger.error(
      `Incoming Summary -> unable to get range data, error: ${JSON.stringify(
        error
      )}`
    );

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  getAll,
  getByDateRange
};
