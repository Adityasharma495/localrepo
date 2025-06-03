const Broker = require('rascal').BrokerAsPromised;
const config = require('../../shared/config/rabitmq-config.json');
const {  IncomingSummaryRepository } = require("../../shared/c_repositories");
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
  IncomingReportDecemberW1Repository,IncomingReportDecemberW2Repository,IncomingReportDecemberW3Repository,IncomingReportDecemberW4Repository, } = require("../../shared/c_repositories");
  
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


const getDateTimeFormat = (date) =>{

            const startdateIST = moment.tz(date, "Asia/Kolkata"); // Parse as IST
            const startdateUTC = startdateIST.utc().toDate(); // Convert to UTC Date Object

            const now = new Date(startdateUTC);
            const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
            const istDate = new Date(now.getTime() + istOffset);

            return istDate;

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

            try {
              report_data = {
                 user_id : cdrJson.userId ? cdrJson.userId : null,
                 call_sid : cdrJson.id,
                 caller_number : cdrJson.callerFrom,
                 callee_number : cdrJson.calleeTo,
                 start_time : getDateTimeFormat(cdrJson.timings.START),
                 end_time : getDateTimeFormat(cdrJson.timings.END),
                 dtmf : cdrJson.dtmf,
                 billing_duration : cdrJson.duration.billing
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

            const key = `incomingReport${month}W${week}Repo`;
            const repoInstance = repositoryMap[key];
            const report = await repoInstance.create(report_data);
            if(report){
              reportFlag = true;
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
              startOfDay.setHours(0, 0, 0, 0);
              const startDateCheck = getDateTimeFormat(startOfDay);
              const startDate = getDateTimeFormat(cdrJson.timings.START);
              const userId = cdrJson.userId;
              Logger.info("USer ID :  "+userId);
              const connectedCalls = (cdrJson.duration.billing > 0 ? 1 : 0);
              Logger.info("connect : "+connectedCalls);

              const incoming = await incomingSummaryRepo.isSummaryExist(userId , did , startDateCheck);

              if(incoming){
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
                        billing_duration: incoming.billing_duration+cdrJson.duration.billing   
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
                       billing_duration : cdrJson.duration.billing 
                   }

                   const summary = await incomingSummaryRepo.create(summary_data);
                   if(summary){
                    summaryFlag = true;
                   }
                   Logger.info(`Incoming Summary -> added successfully: ${JSON.stringify(summary)}`);

              }
           }
           catch (error) {
                 Logger.error(
                   `Incoming Summary -> unable to create Incoming Summary: ${JSON.stringify(
                     summary_data
                   )} error: ${JSON.stringify(error)}`
            );
           }
           if(reportFlag === true && summaryFlag === true){
            const data = {
                  did : cdrJson.calleeTo,
                  billingDuration : cdrJson.duration.billing 
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
