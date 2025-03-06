const Broker = require('rascal').BrokerAsPromised;
const config = require('../config/rabitmq-config.json');

(async () => {
     
    try {

         const broker = await Broker.create(config.rmq);
         broker.on(
	              'error', 
	              (err)=>{
	    	          console.error(`Error in Connection: ${err}`)
	              }
         );
         console.log('Connection to RabbitMQ broker was successful!');

         const subscription = await broker.subscribe('cdr_subscriber');
         console.log("subscribed");

         subscription
         .on('message', async (message, content, ackOrNack) => {
            console.log(content);
            const cdrJson = content;//JSON.parse(content);
            

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
