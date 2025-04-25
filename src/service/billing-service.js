const Broker = require('rascal').BrokerAsPromised;
const config = require('../config/rabitmq-config.json');
const {  DIDUserMappingRepository , UserRepository , AgentRepository, CreditRepository} = require("../repositories");
const didUserMappingRepo = new DIDUserMappingRepository();
const agentRepo = new AgentRepository();
const userRepo = new UserRepository();
const creditHistoryRepo = new CreditRepository();
const { Logger } = require("../config");
const mongoose = require('mongoose');
const moment = require("moment-timezone");
const {DID_LEVELS } = require('../utils/common/constants');


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

const inbound = (detail,level) =>{

    let inboundDuration = null;
    if (detail.level === level && detail.voice_plan_id && Array.isArray(detail.voice_plan_id.plans))
    {
       const inboundPlan = detail.voice_plan_id.plans.find(plan => plan.plan_type === "INBOUND");
       if (inboundPlan) 
       { 
            inboundDuration = inboundPlan.pulse_price;

       }
    }

    return inboundDuration;
   
}

const updateCredits = async(finalUpdateCredits)=>{
    
    if(finalUpdateCredits.length>0){

        for(let i=0;i<finalUpdateCredits.length;i++){
            
            let credits = 0.0;
            if(finalUpdateCredits[i].level === DID_LEVELS.PARENT_RESELLER){
                credits = finalUpdateCredits[i].resellerParentNewCredits;
            }else if(finalUpdateCredits[i].level === DID_LEVELS.RESELLER){
                credits = finalUpdateCredits[i].resellerNewCredits;
            }
            else if(finalUpdateCredits[i].level === DID_LEVELS.CALL_CENTER){
                credits = finalUpdateCredits[i].companyParentNewCredits;
            }
            else if(finalUpdateCredits[i].level === DID_LEVELS.COMPANY){
                credits = finalUpdateCredits[i].companyNewCredits;
            }
            const userDetail = await userRepo.get(finalUpdateCredits[i].userId);
            if(userDetail){
                 
                const availableCredits = userDetail.credits_available;
                const updatedCredtis = availableCredits - credits;
                Logger.info(`USER ID : ${finalUpdateCredits[i].userId} , Updated Credits : ${updatedCredtis} `);
                const user = await userRepo.update(finalUpdateCredits[i].userId, {credits_available : updatedCredtis});
                 
                if(user){
                    Logger.info(` Credits Updated for USER ID : ${finalUpdateCredits[i].userId}`);

                    const data = {
                          user_id : finalUpdateCredits[i].userId,
                          from_user : finalUpdateCredits[i].userId,
                          to_user : finalUpdateCredits[i].userId,
                          action_user : finalUpdateCredits[i].userId,
                          credits_rupees : credits,
                          balance : updatedCredtis,
                          action : "inbound_deduction"
                    }
                    const creditHistory = await creditHistoryRepo.create(data);
                    if(creditHistory){
                        console.log('Credit History Added : ',JSON.stringify(creditHistory));
                    }
                }
                
            }
        }

    }

}

const billingCalculation = async(mappingDetails,billingDuration) =>{
      
    
    
     try{
         
        let resellerParentAvailableCredits = 0.0;
        let resellerAvailableCredits = 0.0;
        let companyParentAvailableCredits = 0.0;
        let companyAvailableCredits = 0.0;

        let resellerParentNewCredits = 0.0;
        let resellerNewCredits = 0.0;
        let companyParentNewCredits = 0.0;
        let companyNewCredits = 0.0;
        
        let finalUserCreditsDeduction = [];

        if(mappingDetails && mappingDetails.mapping_detial.length>0){
             
            const mappingArray = mappingDetails.mapping_detial;

            for(let i =1;i<mappingArray.length;i++){

                    if(mappingArray[i].level === DID_LEVELS.PARENT_RESELLER){
                           const userDetails  = await userRepo.get(mappingArray[i].allocated_to);  
                           resellerParentAvailableCredits = userDetails.credits_available;
                           const pulsePrice = inbound(mappingArray[i],mappingArray[i].level);
                           if(pulsePrice!=null){
                                const pulsePrice1 =  (pulsePrice/100)*billingDuration
                                resellerParentNewCredits = pulsePrice1;

                                if(resellerParentAvailableCredits < resellerParentNewCredits){
                                    const response = {
                                        code : -1,
                                        message: "Parent Reseller Voice Credits Low. Please Recharge.",
                                        finalUserCredtis : []
                                    }
                                    return response;
                                }else{
                                    finalUserCreditsDeduction.push({
                                        level : "1",
                                        userId : mappingArray[i].allocated_to,
                                        resellerParentNewCredits : resellerParentNewCredits
                                    });
                                }
                           }

                    }
                    else if(mappingArray[i].level === DID_LEVELS.RESELLER){
                        const userDetails  = await userRepo.get(mappingArray[i].allocated_to);

                        resellerAvailableCredits = userDetails.credits_available;

                        const pulsePrice = inbound(mappingArray[i],mappingArray[i].level);
                           if(pulsePrice!=null){
                                const pulsePrice1 =  (pulsePrice/100)*billingDuration;
                                resellerNewCredits = pulsePrice1;

                                if(resellerAvailableCredits < resellerNewCredits){
                                    const response = {
                                        code : -1,
                                        message: "Reseller Voice Credits Low. Please Recharge.",
                                        finalUserCredtis : []
                                    }
                                    return response;
                                }else{
                                    finalUserCreditsDeduction.push({
                                        level : "2",
                                        userId : mappingArray[i].allocated_to,
                                        resellerNewCredits : resellerNewCredits
                                    });
                                }
                           }
                    }
                    else if(mappingArray[i].level === DID_LEVELS.CALL_CENTER){
                        const userDetails  = await userRepo.get(mappingArray[i].parent_id);
                        companyParentAvailableCredits = userDetails.credits_available;

                        const pulsePrice = inbound(mappingArray[i],mappingArray[i].level);
                           if(pulsePrice!=null){
                                const pulsePrice1 =  (pulsePrice/100)*billingDuration;
                                companyParentNewCredits = pulsePrice1;
                                if(companyParentAvailableCredits < companyParentNewCredits){
                                    const response = {
                                        code : -1,
                                        message: "Company Parent Voice Credits Low. Please Recharge.",
                                        finalUserCredtis : []
                                    }
                                    return response;
                                }else{
                                    finalUserCreditsDeduction.push({
                                        level : mappingArray[i].level,
                                        userId : mappingArray[i].parent_id,
                                        companyParentNewCredits : companyParentNewCredits
                                    });
                                }
                           }
                    }
                    else if(mappingArray[i].level === DID_LEVELS.COMPANY){
                        const userDetails  = await userRepo.get(mappingArray[i].parent_id);
                        companyAvailableCredits = userDetails.credits_available;

                        const pulsePrice = inbound(mappingArray[i],mappingArray[i].level);
                           if(pulsePrice!=null){
                                const pulsePrice =  (pulsePrice/100)*billingDuration;
                                companyNewCredits = pulsePrice;

                                if(companyAvailableCredits < companyNewCredits){
                                    const response = {
                                        code : -1,
                                        message: "Company Voice Credits Low. Please Recharge.",
                                        finalUserCredtis : []
                                    }
                                    return response;
                                }else{
                                    finalUserCreditsDeduction.push({
                                        level : DID_LEVELS.COMPANY,
                                        userId : mappingArray[i].parent_id,
                                        companyNewCredits : companyNewCredits
                                    });
                                }
                           }
                    }
            }          
        }
         return finalUserCreditsDeduction;

     }
     catch(error){
        Logger.info("Error : "+error);
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

         const subscription = await broker.subscribe('billing_subscriber');
         Logger.info("subscribed");

         await mongoConnection();

         const didMappingDetails = await didUserMappingRepo.findDidMappingDetails({did : '680b6036e1d4ee7621ff6b12'});

         console.log("User DID Mapping Detials : "+JSON.stringify(didMappingDetails));

         const finalDeduction = await billingCalculation(didMappingDetails,billingDuration=15);

         console.log("Billing Structure Deduction : "+JSON.stringify(finalDeduction));

         const credits = await updateCredits(finalDeduction);


         subscription
         .on('message', async (message, content, ackOrNack) => {
            Logger.info("subscribed content : " + JSON.stringify(content));
            const billingJson = content;//JSON.parse(content);

            try {

                // const did = billingJson.did;
                // const billingDuration = billingJson.billingDuration;

                // console.log("Did :"+did);

                // const didMappingDetails = didUserMappingRepo.findDidMappingDetails({did : did});

                // console.log("User DID Mapping Detials : "+JSON.stringify(didMappingDetails));

                // const finalDeduction = await billingCalculation(didMappingDetails,billingDuration);

                // console.log("Billing Structure Deduction : "+JSON.stringify(finalDeduction));
            
            }
            catch (error) {
                 Logger.error(
                   `Incoming Report -> unable to create Incoming Report: ${JSON.stringify(
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

