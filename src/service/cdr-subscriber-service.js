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
                 dtmf : cdrJson.dtmf
            }

            Logger.info("Report Date : "+JSON.stringify(report_data));
  
            const report = await incomingReportRepo.create(report_data);
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
              const connectedCalls = (cdrJson.billingDuration > 0 ? 1 : 0);

              const incoming = await incomingSummaryRepo.isSummaryExist(userId , did , startDate);

              if(incoming){
                   console.log("data ... : "+ JSON.stringify(incoming));
                   summary_data = {
                        did : incoming.did,
                        user_id : mongoose.Types.ObjectId.isValid(incoming.userId) ? incoming.userId : null,
                        schedule_date : startDate,
                        nos_processed : (Number(incoming.nos_processed) || 0)+1,
                        connected_calls : (cdrJson.billingDuration > 0 ? (Number(incoming.connected_calls))+1 : incoming.connected_calls),
                        dtmf_count : (Number(incoming.dtmf_count) || 0) + (Number(cdrJson.dtmfCount) || 0),
                        retry_count : (Number(incoming.retry_count)||0) + (Number(cdrJson.retryCount) || 0),
                        sms_count : (Number(incoming.sms_count) || 0) + (Number(cdrJson.smsCount) || 0), 
                        parent_id : mongoose.Types.ObjectId.isValid(incoming.parentId) ? incoming.parentId : null,
                        s_parent_id :  mongoose.Types.ObjectId.isValid(incoming.sparentId) ? incoming.sparentId : null,              
                   }

                   console.log("summary : "+summary_data);
                   
                   const summary = await incomingSummaryRepo.updateSummary(summary_data);
                   Logger.info(`Incoming Summary -> updated successfully: ${JSON.stringify(summary)}`);


              }else{
                   summary_data = {
                       did : cdrJson.calleeTo,
                       user_id : mongoose.Types.ObjectId.isValid(userId) ? incoming.userId : null,
                       schedule_date : startDate,
                       nos_processed : 1,
                       connected_calls : connectedCalls,
                       dtmf_count : cdrJson.dtmfCount ?? 0,
                       retry_count : cdrJson.retryCount ?? 0,
                       sms_count : cdrJson.smsCount ?? 0
                   }

                   console.log("summary : "+summary_data);

                   const summary = await incomingSummaryRepo.create(summary_data);
                   Logger.info(`Incoming Summary -> added successfully: ${JSON.stringify(summary)}`);

              }
           }
           catch (error) {
                 Logger.error(
                   `Incoming Summary -> unable to create Incoming Summary: ${JSON.stringify(
                     report_data
                   )} error: ${JSON.stringify(error)}`
            );
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
