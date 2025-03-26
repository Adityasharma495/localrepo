const Subscriber = require('../db/subscriber');


async function addSubscriber(data) {
    try {
        const newSubscriber = await Subscriber.create(data);
        console.log("New Subscriber Added:", newSubscriber.toJSON());
    } catch (error) {
        console.error("Error adding subscriber:", error);
    }
}

module.exports = {addSubscriber}
