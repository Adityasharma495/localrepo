const Broker = require('rascal').BrokerAsPromised;
const config = require('../config/rabitmq-config.json');
const {  DIDUserMappingRepository , UserRepository , AgentRepository, CreditsRepository, CompanyRepository} = require("../c_repositories");
const didUserMappingRepo = new DIDUserMappingRepository();
const agentRepo = new AgentRepository();
const userRepo = new UserRepository();
const creditHistoryRepo = new CreditsRepository();
const companyRepo = new CompanyRepository();
const { Logger } = require("../config");
const mongoose = require('mongoose');
const moment = require("moment-timezone");
const {DID_LEVELS } = require('../utils/common/constants');
const sequelize = require('../config/sequelize');


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

const connectCockroach = async () => {
    try {
      await sequelize.authenticate();
    } catch(error) {
      throw error;
    }
  }

const inbound = (detail,level) =>{

    let inboundPrice = null;
    if (detail.level === String(level) && detail.voice_plan_id && Array.isArray(detail.voice_plan_id.plans))
    {
       const inboundPlan = detail.voice_plan_id.plans.find(plan => plan.plan_type === "INBOUND");
       if (inboundPlan) 
       { 
            inboundPrice = inboundPlan.pulse_price;

       }
    }


    console.log(`Inbound Price : ${inboundPrice} LEVEL : ${level} `);
    return inboundPrice;
   
}

const updateCredits = async(finalUpdateCredits)=>{
    
    if(finalUpdateCredits.length>0){

        for(let i=0;i<finalUpdateCredits.length;i++){
            
            let credits = 0.0;
            if(finalUpdateCredits[i].level === DID_LEVELS.SUPER_PARENT_RESELLER){
                credits = finalUpdateCredits[i].resellerSuperParentNewCredits;
            }
            else if(finalUpdateCredits[i].level === DID_LEVELS.PARENT_RESELLER){
                credits = finalUpdateCredits[i].resellerParentNewCredits;
            }else if(finalUpdateCredits[i].level === DID_LEVELS.RESELLER){
                credits = finalUpdateCredits[i].resellerNewCredits;
            }
            else if(finalUpdateCredits[i].level === DID_LEVELS.COMPANY){
                credits = finalUpdateCredits[i].companyParentNewCredits;
            }

            if(finalUpdateCredits[i].level === DID_LEVELS.COMPANY){
                const companyDetail = await companyRepo.get(finalUpdateCredits[i].companyId);
                if(companyDetail){
                    const availableCredits = companyDetail[0].credits_available;
                    const updatedCredtis = availableCredits - credits;
                    Logger.info(`Company ID : ${finalUpdateCredits[i].companyId} , Updated Credits : ${updatedCredtis} `);
                    const company = await companyRepo.update(finalUpdateCredits[i].companyId, {credits_available : updatedCredtis});
                    if(company){

                    Logger.info(` Credits Updated for Company ID : ${finalUpdateCredits[i].companyId}`);

                    const data = {
                          user_id : finalUpdateCredits[i].companyId,
                          type : "Company",
                          from_user : finalUpdateCredits[i].companyId,
                          to_user : finalUpdateCredits[i].companyId,
                          action_user : finalUpdateCredits[i].companyId,
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
            else {
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
                          action : "inbound_deduction",
                          type: "User",
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

}

const billingCalculation = async(mappingDetails,billingDuration) =>{
      
    
    
     try{
         
        let resellerSuperParentAvailableCredits = 0.0;
        let resellerParentAvailableCredits = 0.0;
        let resellerAvailableCredits = 0.0;
        let companyParentAvailableCredits = 0.0;
        let companyAvailableCredits = 0.0;

        let resellerSuperParentNewCredits = 0.0;
        let resellerParentNewCredits = 0.0;
        let resellerNewCredits = 0.0;
        let companyParentNewCredits = 0.0;
        let companyNewCredits = 0.0;
        
        let finalUserCreditsDeduction = [];

        if(mappingDetails && mappingDetails.mapping_detial.length>0){
             
            const mappingArray = mappingDetails.mapping_detial;

            for(let i =1;i<mappingArray.length;i++){
                     
                    if(mappingArray[i].level === DID_LEVELS.SUPER_PARENT_RESELLER){
                           const userDetails  = await userRepo.get(mappingArray[i].allocated_to);  
                           resellerSuperParentAvailableCredits = userDetails.credits_available;
                           const pulsePrice = inbound(mappingArray[i],mappingArray[i].level);
                           if(pulsePrice!=null){
                                const pulsePrice1 =  (pulsePrice/100)*billingDuration
                                resellerSuperParentNewCredits = pulsePrice1;

                                if(resellerSuperParentAvailableCredits < resellerSuperParentNewCredits){
                                    const response = {
                                        code : -1,
                                        message: "Super Parent Reseller Voice Credits Low. Please Recharge.",
                                        finalUserCredtis : []
                                    }
                                    return response;
                                }else{
                                    finalUserCreditsDeduction.push({
                                        level : mappingArray[i].level,
                                        userId : mappingArray[i].allocated_to,
                                        resellerSuperParentNewCredits : resellerSuperParentNewCredits
                                    });
                                }
                           }

                    }
                    else if(mappingArray[i].level === DID_LEVELS.PARENT_RESELLER){
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
                                        level : mappingArray[i].level,
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
                                        level : mappingArray[i].level,
                                        userId : mappingArray[i].allocated_to,
                                        resellerNewCredits : resellerNewCredits
                                    });
                                }
                           }
                    }
                    else if(mappingArray[i].level === DID_LEVELS.COMPANY){
                        const companyDetails = await companyRepo.get(mappingArray[i].allocated_to);
                        companyParentAvailableCredits = companyDetails.credits_available;

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
                                        companyId : mappingArray[i].allocated_to,
                                        companyParentNewCredits : companyParentNewCredits
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

        //  await mongoConnection();
         await connectCockroach();

         const didMappingDetails = await didUserMappingRepo.findDidMappingDetails({did : 5});

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

                // console.log(`DID : ${did} , Billing Duration : ${billingDuration} `);

                // const didMappingDetails = await didUserMappingRepo.findDidMappingDetails({did : did});

                // console.log("User DID Mapping Detials : "+JSON.stringify(didMappingDetails));

                // const finalDeduction = await billingCalculation(didMappingDetails,billingDuration);

                // console.log("Billing Structure Deduction : "+JSON.stringify(finalDeduction));

                // const credits = await updateCredits(finalDeduction);
            
            }
            catch (error) {
                 Logger.error(
                   `Incoming Report -> unable to create Incoming Report: ${JSON.stringify(
                     error
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

