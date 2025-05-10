const Broker = require('rascal').BrokerAsPromised;
const config = require('../config/rabitmq-config.json');
const { IncomingReportRepository , IncomingSummaryRepository } = require("../c_repositories");
const incomingReportRepo = new IncomingReportRepository();
const incomingSummaryRepo = new IncomingSummaryRepository();
const { IncomingReportMayW1Repository , IncomingReportMayW2Repository,IncomingReportMayW3Repository , IncomingReportMayW4Repository, IncomingReportJuneW1Repository, IncomingReportJuneW2Repository, IncomingReportJuneW3Repository, IncomingReportJuneW4Repository } = require("../c_repositories"); 

const incomingReport5W1Repo = new IncomingReportMayW1Repository();
const incomingReport5W2Repo = new IncomingReportMayW2Repository();
const incomingReport5W3Repo = new IncomingReportMayW3Repository();
const incomingReport5W4Repo = new IncomingReportMayW4Repository();

const incomingReport4W1Repo = new IncomingReportJuneW1Repository();
const incomingReport4W2Repo = new IncomingReportJuneW2Repository();
const incomingReport4W3Repo = new IncomingReportJuneW3Repository();
const incomingReport4W4Repo = new IncomingReportJuneW4Repository();

const { Logger } = require("../config");
const mongoose = require('mongoose');
const moment = require("moment-timezone");
const logger = require('../config/logger-config');
const sequelize = require('../config/sequelize');
const { TOTAL_WEEK_DAYS } = require('../utils/common/constants');


const connectMongo = async() => {
    try {
        await mongoose.connect(config.MONGO_DB_URI);
    } catch (error) {
        throw error;
    }   
}

const connectCockroach = async () => {
  try {
    await sequelize.authenticate();
    Logger.info(`DB -> Successfully connected`);
  } catch(error) {
    throw error;
  }
}

const mongoConnection = async() =>{
    try {
         await connectMongo();
         Logger.info(`Mongodb -> Successfully connected`);
    } catch (error) {
                 Logger.error(`Mongodb -> Error while connecting: ${ JSON.stringify(error) }`)
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
  incomingReport4W1Repo: incomingReport4W1Repo,
  incomingReport4W2Repo: incomingReport4W2Repo,
  incomingReport4W3Repo: incomingReport4W3Repo,
  incomingReport4W4Repo: incomingReport4W4Repo,

  incomingReport5W1Repo: incomingReport5W1Repo,
  incomingReport5W2Repo: incomingReport5W2Repo,
  incomingReport5W3Repo: incomingReport5W3Repo,
  incomingReport5W4Repo: incomingReport5W4Repo,
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
  function isValidUUID(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
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

        //  await mongoConnection();
         await connectCockroach();

         let reportFlag = false;
         let summaryFlag = false;

         subscription
         .on('message', async (message, content, ackOrNack) => {
            Logger.info("subscribed content : " + JSON.stringify(content));
            const cdrJson = JSON.parse(content);//JSON.parse(content);
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
              logger.info(".........."+new Date(cdrJson.timings.START).toISOString());
              let start =  new Date(cdrJson.timings.START).toISOString();
              let startOfDay = new Date(start);
              Logger.info(`Start Of  Date : ${startOfDay} `);
              startOfDay.setHours(0, 0, 0, 0);
              const startDateCheck = getDateTimeFormat(startOfDay);
              const startDate = getDateTimeFormat(cdrJson.timings.START);
              const userId = cdrJson.userId;
              console.log("USer ID :  "+userId);
              const connectedCalls = (cdrJson.duration.billing > 0 ? 1 : 0);
              console.log("connect : "+connectedCalls);

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
            insertDataInBillingQueue(broker, "billing_queue" , {data});
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
