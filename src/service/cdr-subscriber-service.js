const Broker = require('rascal').BrokerAsPromised;
const config = require('../config/rabitmq-config.json');
const { IncomingReportRepository , IncomingSummaryRepository } = require("../repositories");
const incomingReportRepo = new IncomingReportRepository();
const incomingSummaryRepo = new IncomingSummaryRepository();
const { Logger } = require("../config");
const mongoose = require('mongoose');
const moment = require("moment-timezone");


const connectMongo = async() => {
    try {
        await mongoose.connect(config.MONGO_DB_URI);
    } catch (error) {
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

         await mongoConnection();

         let reportFlag = false;
         let summaryFlag = false;

         subscription
         .on('message', async (message, content, ackOrNack) => {
            Logger.info("subscribed content : " + JSON.stringify(content));
            const cdrJson = content;//JSON.parse(content);
            let report_data = {};
            let summary_data = {};

            try {
              report_data = {
                 user_id : mongoose.Types.ObjectId.isValid(cdrJson.userId) ? cdrJson.userId : null,
                 call_sid : cdrJson.id,
                 caller_number : cdrJson.callerFrom,
                 callee_number : cdrJson.calleeTo,
                 start_time : getDateTimeFormat(cdrJson.timings.START),
                 end_time : getDateTimeFormat(cdrJson.timings.END),
                 dtmf : cdrJson.dtmf,
                 billing_duration : cdrJson.duration.billing
            }

            Logger.info("Report Date : "+JSON.stringify(report_data));
  
            const report = await incomingReportRepo.create(report_data);
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
              const startDate = getDateTimeFormat(cdrJson.timings.START);
              const userId = cdrJson.userId;
              console.log("USer ID :  "+userId);
              const connectedCalls = (cdrJson.duration.billing > 0 ? 1 : 0);
              console.log("connect : "+connectedCalls);

              const incoming = await incomingSummaryRepo.isSummaryExist(userId , did , startDate);

              if(incoming){
                   summary_data = {
                        did : incoming.did,
                        user_id : mongoose.Types.ObjectId.isValid(userId) ? userId : null,
                        schedule_date : startDate,
                        nos_processed : (Number(incoming.nos_processed) || 0)+1,
                        connected_calls : (connectedCalls > 0 ? (Number(incoming.connected_calls))+1 : connectedCalls),
                        dtmf_count : (Number(incoming.dtmf_count) || 0) + (Number(cdrJson.dtmfCount) || 0),
                        retry_count : (Number(incoming.retry_count)||0) + (Number(cdrJson.retryCount) || 0),
                        sms_count : (Number(incoming.sms_count) || 0) + (Number(cdrJson.smsCount) || 0), 
                        parent_id : mongoose.Types.ObjectId.isValid(incoming.parentId) ? incoming.parentId : null,
                        s_parent_id :  mongoose.Types.ObjectId.isValid(incoming.sparentId) ? incoming.sparentId : null,
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
                       user_id : mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null,
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
                  did : cdrJson.calleeTo
            }
               //insertDataInBillingQueue(broker, "billing_queue" , {data});
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
