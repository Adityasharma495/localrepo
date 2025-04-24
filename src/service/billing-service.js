const Broker = require('rascal').BrokerAsPromised;
const config = require('../config/rabitmq-config.json');
const {  DIDUserMappingRepository , UserRepository , AgentRepository} = require("../repositories");
const didUserMappingRepo = new DIDUserMappingRepository();
const agentRepo = new AgentRepository();
const userRepo = new UserRepository();
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

const inboundPlanDuration = (detail,level) =>{

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
                const userDetails  = await userRepo.get(mappingArray[i].allocated_to);
                if(userDetails){
                    if(mappingArray[i].level === "1"){
                           
                           resellerParentAvailableCredits = userDetails.credits_available;

                           const planDuration = inboundPlanDuration(mappingArray[i],mappingArray[i].level);
                           if(planDuration!=null){
                                const pulseCount =  Math.ceil(billingDuration/planDuration);
                                resellerParentNewCredits = pulseCount*billingDuration;
                                console.log("......"+resellerParentNewCredits);

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
                    else if(mappingArray[i].level === "2"){

                        resellerAvailableCredits = userDetails.credits_available;

                        const planDuration = inboundPlanDuration(mappingArray[i],mappingArray[i].level);
                           if(planDuration!=null){
                                const pulseCount =  Math.ceil(billingDuration/planDuration);
                                resellerNewCredits = pulseCount*billingDuration;

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
                    else if(mappingArray[i].level === "3"){

                        companyParentAvailableCredits = userDetails.credits_available;

                        const planDuration = inboundPlanDuration(mappingArray[i],mappingArray[i].level);
                           if(planDuration!=null){
                                const pulseCount =  Math.ceil(billingDuration/planDuration);
                                companyParentNewCredits = pulseCount*billingDuration;

                                if(companyParentAvailableCredits < companyParentNewCredits){
                                    const response = {
                                        code : -1,
                                        message: "Company Parent Voice Credits Low. Please Recharge.",
                                        finalUserCredtis : []
                                    }
                                    return response;
                                }else{
                                    finalUserCreditsDeduction.push({
                                        level : "2",
                                        userId : mappingArray[i].allocated_to,
                                        companyParentNewCredits : companyParentNewCredits
                                    });
                                }
                           }
                    }
                    else if(mappingArray[i].level === "5"){

                        companyAvailableCredits = userDetails.credits_available;

                        const planDuration = inboundPlanDuration(mappingArray[i],mappingArray[i].level);
                           if(planDuration!=null){
                                const pulseCount =  Math.ceil(billingDuration/planDuration);
                                companyNewCredits = pulseCount*billingDuration;

                                if(companyAvailableCredits < companyNewCredits){
                                    const response = {
                                        code : -1,
                                        message: "Company Voice Credits Low. Please Recharge.",
                                        finalUserCredtis : []
                                    }
                                    return response;
                                }else{
                                    finalUserCreditsDeduction.push({
                                        level : "2",
                                        userId : mappingArray[i].allocated_to,
                                        companyNewCredits : companyNewCredits
                                    });
                                }
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

         const agent = await agentRepo.getAllAgentss();

         console.log("............"+JSON.stringify(agent));



        //  const didMappingDetails = await didUserMappingRepo.findDidMappingDetails({did : '6805f97335b5efe71489b484'});

        //  console.log("User DID Mapping Detials : "+JSON.stringify(didMappingDetails));

        //  const finalDeduction = await billingCalculation(didMappingDetails,billingDuration=15);

        //  console.log("Billing Structure Deduction : "+JSON.stringify(finalDeduction));


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

