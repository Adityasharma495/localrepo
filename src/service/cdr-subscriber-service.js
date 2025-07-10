const Broker = require('rascal').BrokerAsPromised;
const config = require('../../shared/config/rabitmq-config.json');
const {  IncomingSummaryRepository, AgentRepository } = require("../../shared/c_repositories");
const incomingSummaryRepo = new IncomingSummaryRepository();
const { IncomingReportJanuaryW1Repository,IncomingReportJanuaryW2Repository,IncomingReportJanuaryW3Repository,IncomingReportJanuaryW4Repository,
  IncomingReportFebruaryW1Repository,IncomingReportFebruaryW2Repository,IncomingReportFebruaryW3Repository,IncomingReportFebruaryW4Repository,
  IncomingReportMarchW1Repository,IncomingReportMarchW2Repository,IncomingReportMarchW3Repository,IncomingReportMarchW4Repository,
  IncomingReportAprilW1Repository,IncomingReportAprilW2Repository,IncomingReportAprilW3Repository,IncomingReportAprilW4Repository,
  IncomingReportMayW1Repository,IncomingReportMayW2Repository,IncomingReportMayW3Repository,IncomingReportMayW4Repository,
  IncomingReportJuneW1Repository,IncomingReportJuneW2Repository,IncomingReportJuneW3Repository,IncomingReportJuneW4Repository,
  IncomingReportJulyW1Repository,IncomingReportJulyW2Repository,IncomingReportJulyW3Repository,IncomingReportJulyW4Repository,
  IncomingReportAugustW1Repository,IncomingReportAugustW2Repository,IncomingReportAugustW3Repository,IncomingReportAugustW4Repository,
  IncomingReportSeptemberW1Repository,IncomingReportSeptemberW2Repository,IncomingReportSeptemberW3Repository,IncomingReportSeptemberW4Repository,
  IncomingReportOctoberW1Repository,IncomingReportOctoberW2Repository,IncomingReportOctoberW3Repository,IncomingReportOctoberW4Repository,
  IncomingReportNovemberW1Repository,IncomingReportNovemberW2Repository,IncomingReportNovemberW3Repository,IncomingReportNovemberW4Repository,
  IncomingReportDecemberW1Repository,IncomingReportDecemberW2Repository,IncomingReportDecemberW3Repository,IncomingReportDecemberW4Repository } = require("../../shared/c_repositories");

  const {
    OutboundReportJanuaryW1Repository, OutboundReportJanuaryW2Repository, OutboundReportJanuaryW3Repository, OutboundReportJanuaryW4Repository,
    OutboundReportFebruaryW1Repository, OutboundReportFebruaryW2Repository, OutboundReportFebruaryW3Repository, OutboundReportFebruaryW4Repository,
    OutboundReportMarchW1Repository, OutboundReportMarchW2Repository, OutboundReportMarchW3Repository, OutboundReportMarchW4Repository,
    OutboundReportAprilW1Repository, OutboundReportAprilW2Repository, OutboundReportAprilW3Repository, OutboundReportAprilW4Repository,
    OutboundReportMayW1Repository, OutboundReportMayW2Repository, OutboundReportMayW3Repository, OutboundReportMayW4Repository,
    OutboundReportJuneW1Repository, OutboundReportJuneW2Repository, OutboundReportJuneW3Repository, OutboundReportJuneW4Repository,
    OutboundReportJulyW1Repository, OutboundReportJulyW2Repository, OutboundReportJulyW3Repository, OutboundReportJulyW4Repository,
    OutboundReportAugustW1Repository, OutboundReportAugustW2Repository, OutboundReportAugustW3Repository, OutboundReportAugustW4Repository,
    OutboundReportSeptemberW1Repository, OutboundReportSeptemberW2Repository, OutboundReportSeptemberW3Repository, OutboundReportSeptemberW4Repository,
    OutboundReportOctoberW1Repository, OutboundReportOctoberW2Repository, OutboundReportOctoberW3Repository, OutboundReportOctoberW4Repository,
    OutboundReportNovemberW1Repository, OutboundReportNovemberW2Repository, OutboundReportNovemberW3Repository, OutboundReportNovemberW4Repository,
    OutboundReportDecemberW1Repository, OutboundReportDecemberW2Repository, OutboundReportDecemberW3Repository, OutboundReportDecemberW4Repository
  } = require("../../shared/c_repositories");
  
const incomingReport1W1Repo = new IncomingReportJanuaryW1Repository();
const incomingReport1W2Repo = new IncomingReportJanuaryW2Repository();
const incomingReport1W3Repo = new IncomingReportJanuaryW3Repository();
const incomingReport1W4Repo = new IncomingReportJanuaryW4Repository();

const incomingReport2W1Repo = new IncomingReportFebruaryW1Repository();
const incomingReport2W2Repo = new IncomingReportFebruaryW2Repository();
const incomingReport2W3Repo = new IncomingReportFebruaryW3Repository();
const incomingReport2W4Repo = new IncomingReportFebruaryW4Repository();

const incomingReport3W1Repo = new IncomingReportMarchW1Repository();
const incomingReport3W2Repo = new IncomingReportMarchW2Repository();
const incomingReport3W3Repo = new IncomingReportMarchW3Repository();
const incomingReport3W4Repo = new IncomingReportMarchW4Repository();

const incomingReport4W1Repo = new IncomingReportAprilW1Repository();
const incomingReport4W2Repo = new IncomingReportAprilW2Repository();
const incomingReport4W3Repo = new IncomingReportAprilW3Repository();
const incomingReport4W4Repo = new IncomingReportAprilW4Repository();

const incomingReport5W1Repo = new IncomingReportMayW1Repository();
const incomingReport5W2Repo = new IncomingReportMayW2Repository();
const incomingReport5W3Repo = new IncomingReportMayW3Repository();
const incomingReport5W4Repo = new IncomingReportMayW4Repository();

const incomingReport6W1Repo = new IncomingReportJuneW1Repository();
const incomingReport6W2Repo = new IncomingReportJuneW2Repository();
const incomingReport6W3Repo = new IncomingReportJuneW3Repository();
const incomingReport6W4Repo = new IncomingReportJuneW4Repository();

const incomingReport7W1Repo = new IncomingReportJulyW1Repository();
const incomingReport7W2Repo = new IncomingReportJulyW2Repository();
const incomingReport7W3Repo = new IncomingReportJulyW3Repository();
const incomingReport7W4Repo = new IncomingReportJulyW4Repository();

const incomingReport8W1Repo = new IncomingReportAugustW1Repository();
const incomingReport8W2Repo = new IncomingReportAugustW2Repository();
const incomingReport8W3Repo = new IncomingReportAugustW3Repository();
const incomingReport8W4Repo = new IncomingReportAugustW4Repository();

const incomingReport9W1Repo = new IncomingReportSeptemberW1Repository();
const incomingReport9W2Repo = new IncomingReportSeptemberW2Repository();
const incomingReport9W3Repo = new IncomingReportSeptemberW3Repository();
const incomingReport9W4Repo = new IncomingReportSeptemberW4Repository();

const incomingReport10W1Repo = new IncomingReportOctoberW1Repository();
const incomingReport10W2Repo = new IncomingReportOctoberW2Repository();
const incomingReport10W3Repo = new IncomingReportOctoberW3Repository();
const incomingReport10W4Repo = new IncomingReportOctoberW4Repository();

const incomingReport11W1Repo = new IncomingReportNovemberW1Repository();
const incomingReport11W2Repo = new IncomingReportNovemberW2Repository();
const incomingReport11W3Repo = new IncomingReportNovemberW3Repository();
const incomingReport11W4Repo = new IncomingReportNovemberW4Repository();

const incomingReport12W1Repo = new IncomingReportDecemberW1Repository();
const incomingReport12W2Repo = new IncomingReportDecemberW2Repository();
const incomingReport12W3Repo = new IncomingReportDecemberW3Repository();
const incomingReport12W4Repo = new IncomingReportDecemberW4Repository();

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

const { Logger } = require("../../shared/config");
const moment = require("moment-timezone");
const logger = require('../../shared/config/logger-config');
const sequelize = require('../../shared/config/sequelize');
const { TOTAL_WEEK_DAYS } = require('../../shared/utils/common/constants');


const connectCockroach = async () => {
  try {
    await sequelize.authenticate();
    Logger.info(`DB -> Successfully connected`);
  } catch(error) {
    throw error;
  }
}


const repositoryMap = {
  incomingReport1W1Repo: incomingReport1W1Repo,
  incomingReport1W2Repo: incomingReport1W2Repo,
  incomingReport1W3Repo: incomingReport1W3Repo,
  incomingReport1W4Repo: incomingReport1W4Repo,

  incomingReport2W1Repo:incomingReport2W1Repo,
  incomingReport2W2Repo:incomingReport2W2Repo,
  incomingReport2W3Repo:incomingReport2W3Repo,
  incomingReport2W4Repo:incomingReport2W4Repo,

  incomingReport3W1Repo:incomingReport3W1Repo,
  incomingReport3W2Repo:incomingReport3W2Repo,
  incomingReport3W3Repo:incomingReport3W3Repo,
  incomingReport3W4Repo:incomingReport3W4Repo,

  incomingReport4W1Repo:incomingReport4W1Repo,
  incomingReport4W2Repo:incomingReport4W2Repo,
  incomingReport4W3Repo:incomingReport4W3Repo,
  incomingReport4W4Repo:incomingReport4W4Repo,

  incomingReport5W1Repo: incomingReport5W1Repo,
  incomingReport5W2Repo: incomingReport5W2Repo,
  incomingReport5W3Repo: incomingReport5W3Repo,
  incomingReport5W4Repo: incomingReport5W4Repo,

  incomingReport6W1Repo: incomingReport6W1Repo,
  incomingReport6W2Repo: incomingReport6W2Repo,
  incomingReport6W3Repo: incomingReport6W3Repo,
  incomingReport6W4Repo: incomingReport6W4Repo,

  incomingReport7W1Repo:incomingReport7W1Repo,
  incomingReport7W2Repo:incomingReport7W2Repo,
  incomingReport7W3Repo:incomingReport7W3Repo,
  incomingReport7W4Repo:incomingReport7W4Repo,

  incomingReport8W1Repo:incomingReport8W1Repo,
  incomingReport8W2Repo:incomingReport8W2Repo,
  incomingReport8W3Repo:incomingReport8W3Repo,
  incomingReport8W4Repo:incomingReport8W4Repo,

  incomingReport9W1Repo:incomingReport9W1Repo,
  incomingReport9W2Repo:incomingReport9W2Repo,
  incomingReport9W3Repo:incomingReport9W3Repo,
  incomingReport9W4Repo:incomingReport9W4Repo,

  incomingReport10W1Repo:incomingReport10W1Repo,
  incomingReport10W2Repo:incomingReport10W2Repo,
  incomingReport10W3Repo:incomingReport10W3Repo,
  incomingReport10W4Repo:incomingReport10W4Repo,

  incomingReport11W1Repo:incomingReport11W1Repo,
  incomingReport11W2Repo:incomingReport11W2Repo,
  incomingReport11W3Repo:incomingReport11W3Repo,
  incomingReport11W4Repo:incomingReport11W4Repo,

  incomingReport12W1Repo:incomingReport12W1Repo,
  incomingReport12W2Repo:incomingReport12W2Repo,
  incomingReport12W3Repo:incomingReport12W3Repo,
  incomingReport12W4Repo:incomingReport12W4Repo,
};

const outboundRepositoryMap = {
  outboundReport1W1Repo: outboundReport1W1Repo,
  outboundReport1W2Repo: outboundReport1W2Repo,
  outboundReport1W3Repo: outboundReport1W3Repo,
  outboundReport1W4Repo: outboundReport1W4Repo,

  outboundReport2W1Repo:outboundReport2W1Repo,
  outboundReport2W2Repo:outboundReport2W2Repo,
  outboundReport2W3Repo:outboundReport2W3Repo,
  outboundReport2W4Repo:outboundReport2W4Repo,

  outboundReport3W1Repo:outboundReport3W1Repo,
  outboundReport3W2Repo:outboundReport3W2Repo,
  outboundReport3W3Repo:outboundReport3W3Repo,
  outboundReport3W4Repo:outboundReport3W4Repo,

  outboundReport4W1Repo:outboundReport4W1Repo,
  outboundReport4W2Repo:outboundReport4W2Repo,
  outboundReport4W3Repo:outboundReport4W3Repo,
  outboundReport4W4Repo:outboundReport4W4Repo,

  outboundReport5W1Repo: outboundReport5W1Repo,
  outboundReport5W2Repo: outboundReport5W2Repo,
  outboundReport5W3Repo: outboundReport5W3Repo,
  outboundReport5W4Repo: outboundReport5W4Repo,

  outboundReport6W1Repo: outboundReport6W1Repo,
  outboundReport6W2Repo: outboundReport6W2Repo,
  outboundReport6W3Repo: outboundReport6W3Repo,
  outboundReport6W4Repo: outboundReport6W4Repo,

  outboundReport7W1Repo:outboundReport7W1Repo,
  outboundReport7W2Repo:outboundReport7W2Repo,
  outboundReport7W3Repo:outboundReport7W3Repo,
  outboundReport7W4Repo:outboundReport7W4Repo,

  outboundReport8W1Repo:outboundReport8W1Repo,
  outboundReport8W2Repo:outboundReport8W2Repo,
  outboundReport8W3Repo:outboundReport8W3Repo,
  outboundReport8W4Repo:outboundReport8W4Repo,

  outboundReport9W1Repo:outboundReport9W1Repo,
  outboundReport9W2Repo:outboundReport9W2Repo,
  outboundReport9W3Repo:outboundReport9W3Repo,
  outboundReport9W4Repo:outboundReport9W4Repo,

  outboundReport10W1Repo:outboundReport10W1Repo,
  outboundReport10W2Repo:outboundReport10W2Repo,
  outboundReport10W3Repo:outboundReport10W3Repo,
  outboundReport10W4Repo:outboundReport10W4Repo,

  outboundReport11W1Repo:outboundReport11W1Repo,
  outboundReport11W2Repo:outboundReport11W2Repo,
  outboundReport11W3Repo:outboundReport11W3Repo,
  outboundReport11W4Repo:outboundReport11W4Repo,

  outboundReport12W1Repo:outboundReport12W1Repo,
  outboundReport12W2Repo:outboundReport12W2Repo,
  outboundReport12W3Repo:outboundReport12W3Repo,
  outboundReport12W4Repo:outboundReport12W4Repo,
};
const agentRepository = new AgentRepository();

const insertDataInBillingQueue =   async (con,pub,message) =>{
    try {
      const publication = await con.publish(pub, message);
      Logger.info(`Message ${JSON.stringify(message)} published to ${pub}`);
      publication.on('error',
        (err) => {
          Logger.error(`Error event received while publishing to Rabbit MQ: ${err}`);
        }
      );
    }catch(e) {
      Logger.error(`Exception while publishing to Rabbit MQ: ${e}`);
    }
  }

(async () => {
     
    try {

         const broker = await Broker.create(config.rmq);
         broker.on(
	              'error', 
	              (err)=>{
	    	          console.error(`Error in Connection: ${err}`)
	              }
         );
         Logger.info('Connection to RabbitMQ broker was successful!');

         const subscription = await broker.subscribe('cdr_subscriber');
         Logger.info("subscribed");

         await connectCockroach();

         let reportFlag = false;
         let summaryFlag = false;
         let outboundFlag = false;

         subscription
         .on('message', async (message, content, ackOrNack) => {
            Logger.info("subscribed content : " + JSON.stringify(content));
            let cdrJson;
            if (typeof content === "string") {
              cdrJson = JSON.parse(content);//JSON.parse(content);
            } else {
              cdrJson = content;
            }
      
            let report_data = {};
            let summary_data = {};

            if (cdrJson?.calleeTo) {
              if (cdrJson.calleeTo.startsWith("+91")) {
                cdrJson.calleeTo = cdrJson.calleeTo.slice(3)
              }
            }
            if (cdrJson?.callerFrom) {
              if (cdrJson.callerFrom.startsWith("+91")) {
                cdrJson.callerFrom = cdrJson.callerFrom.slice(3)
              }
            }

            if (cdrJson?.calleeTo) {
              if (cdrJson.calleeTo.length === 11) {
                cdrJson.calleeTo = cdrJson.calleeTo.substring(1, cdrJson.calleeTo.length);
              }
            }
            if (cdrJson?.callerFrom) {
              if (cdrJson.callerFrom.length === 11) {
                cdrJson.callerFrom = cdrJson.callerFrom.substring(1, cdrJson.callerFrom.length);
              }
            }

            try {
              report_data = {
                 user_id : cdrJson.userId ? cdrJson.userId : null,
                 call_sid : cdrJson.id,
                 caller_number : cdrJson.callerFrom,
                 callee_number : cdrJson.calleeTo,
                 start_time : cdrJson.timings.START,
                 end_time : cdrJson.timings.END,
                 dtmf : cdrJson.dtmf,
                 billing_duration : cdrJson.duration.billing,
                 trace_id: cdrJson.traceId,
                 patch_duration: cdrJson.duration.patch,
                 answer_status: cdrJson?.status != null ? String(cdrJson.status) : null,
              }

            Logger.info("Report Date : "+JSON.stringify(report_data));

            const now = new Date();
            const date = now.getUTCDate();
            const month = now.getUTCMonth() + 1;
            let week = 0;
            if(date>28){
                week = Math.floor(date/TOTAL_WEEK_DAYS);
            }else{
                week = Math.ceil(date/TOTAL_WEEK_DAYS);
            }

            let report;
            let outboundReport;
            if (cdrJson.callLeg === "A_PARTY") {

              report_data["bridge_ring_duration"] = cdrJson.ring;
              const key = `incomingReport${month}W${week}Repo`;
              const repoInstance = repositoryMap[key];
              report = await repoInstance.create(report_data);

            } else if(cdrJson.callLeg === "B_PARTY") {
              if (cdrJson.agent) {
                let agentData;
                if (cdrJson.agent.number) {
                  agentData = await agentRepository.find({where: {
                    agent_number: cdrJson.agent.number
                  }});
                }
                if (agentData) {
                  if (agentData.agent_number) {
                    if (agentData.agent_number.length === 11) {
                      agentData.agent_number = agentData.agent_number.substring(1, agentData.agent_number.length);
                    }
                    report_data["agent_number"] = agentData.agent_number;
                  }
                  report_data["agent_name"] = agentData.agent_name;
                  report_data["agent_id"] = agentData.id;
                }
              }

              report_data["ring_duration"] =  cdrJson.ring;
              const key = `outboundReport${month}W${week}Repo`;
              const repoInstance = outboundRepositoryMap[key];
              outboundReport = await repoInstance.create(report_data);
            }

            if(report){
              reportFlag = true;
            }
            if(outboundReport) {
              outboundFlag = true;
            }
            
            Logger.info(`Incoming Report -> added successfully: ${JSON.stringify(report)}`);
           }
           catch (error) {
                 Logger.error(
                   `Incoming Report -> unable to create Incoming Report: ${JSON.stringify(
                     report_data
                   )} error: ${JSON.stringify(error)}`
            );
           }

           try{
              
              const did = cdrJson.calleeTo;
              Logger.info(".........."+new Date(cdrJson.timings.START).toISOString());
              let start =  new Date(cdrJson.timings.START).toISOString();
              let startOfDay = new Date(start);
              Logger.info(`Start Of  Date : ${startOfDay} `);
              startOfDay.setUTCHours(0, 0, 0, 0);
              const startDateCheck = startOfDay;
              const startDate = cdrJson.timings.START;
              const userId = cdrJson.userId;
              Logger.info("USer ID :  "+userId);
              // const connectedCalls = ((Number(cdrJson?.duration?.billing) + Number(cdrJson?.duration?.patch)) > 0 ? 1 : 0);
              const connectedCalls = (Number(cdrJson.status) > 0 ? 1 : 0);
              Logger.info("connect : "+connectedCalls);

              let incoming;

              if (cdrJson.callLeg === "A_PARTY") {
                incoming = await incomingSummaryRepo.isSummaryExist(userId , did , startDateCheck);
                if(incoming){
                  if (incoming?.did) {
                    if (incoming.did.startsWith("+91")) {
                      incoming.did = incoming?.did?.slice(3)
                    }

                    if (incoming?.did?.length === 11) {
                      incoming.did = incoming?.did?.substring(1, incoming?.did?.length);
                    }
                  }
                  
                   summary_data = {
                        did : incoming.did,
                        user_id: cdrJson.userId ? cdrJson.userId : null,
                        schedule_date : startDate,
                        nos_processed : (Number(incoming.nos_processed) || 0)+1,
                        connected_calls : (connectedCalls > 0 ? (Number(incoming.connected_calls))+1 : connectedCalls),
                        dtmf_count : (Number(incoming.dtmf_count) || 0) + (Number(cdrJson.dtmfCount) || 0),
                        retry_count : (Number(incoming.retry_count)||0) + (Number(cdrJson.retryCount) || 0),
                        sms_count : (Number(incoming.sms_count) || 0) + (Number(cdrJson.smsCount) || 0), 
                        parent_id : cdrJson.userId ? cdrJson.userId : null,
                        s_parent_id : cdrJson.userId ? cdrJson.userId : null,
                        billing_duration: Number(incoming.billing_duration)+(Number(cdrJson.duration.billing) + Number(cdrJson.duration.patch))   
                   }

                   const summary = await incomingSummaryRepo.updateSummary(summary_data, startDate);
                   if(summary){
                      summaryFlag = true;
                   }
                   Logger.info(`Incoming Summary -> updated successfully: ${JSON.stringify(summary)}`);


              }else{
                   summary_data = {
                       did : cdrJson.calleeTo,
                       user_id: cdrJson.userId ? cdrJson.userId : null,
                       schedule_date : startDate,
                       nos_processed : 1,
                       connected_calls : connectedCalls,
                       dtmf_count : cdrJson.dtmfCount ?? 0,
                       retry_count : cdrJson.retryCount ?? 0,
                       sms_count : cdrJson.smsCount ?? 0,
                       billing_duration : (Number(cdrJson.duration.billing) + Number(cdrJson.duration.patch)) 
                   }

                   const summary = await incomingSummaryRepo.create(summary_data);
                   if(summary){
                    summaryFlag = true;
                   }
                   Logger.info(`Incoming Summary -> added successfully: ${JSON.stringify(summary)}`);

              }
              } 
           }
           catch (error) {
                 Logger.error(
                   `Incoming Summary -> unable to create Incoming Summary: ${JSON.stringify(
                     summary_data
                   )} error: ${JSON.stringify(error)}`
            );
           }
           Logger.info("reportFlag :  "+reportFlag);
           Logger.info("outboundFlag :  "+outboundFlag);
           Logger.info("summaryFlag :  "+summaryFlag);
           Logger.info("cdrJson?.callLeg :  "+cdrJson?.callLeg);
           if((reportFlag === true || outboundFlag === true) && (summaryFlag === true || cdrJson?.callLeg === 'B_PARTY')){
            const billingDuration = (cdrJson?.callLeg === "A_PARTY") ? (Number(cdrJson.duration.billing) + Number(cdrJson.duration.patch)) : Number(cdrJson.duration.billing)
            const data = {
                  did: cdrJson?.callLeg === "A_PARTY" ? cdrJson?.calleeTo : cdrJson?.callerFrom,
                  billingDuration : billingDuration,
                  callLeg: cdrJson.callLeg
            }
            insertDataInBillingQueue(broker, "billing_publisher" , {data});

            Logger.info("Data Published in Billing Queue");
           }

            ackOrNack();
         })
         .on('error', (err)=>{
	    	console.error(`Error in Receiving: ${err}`)
	     });





    }
    catch (err) {
       console.error(`Exception ${err}`);
    }

})();
