const CrudRepository = require("./crud-repository");
const { Subscriber } = require("../c_db");

class SubscriberRepository extends CrudRepository {
  constructor() {
    super(Subscriber);
  }

  async addSubscriber(data) {
    try {
      const username = String(data.username).trim();
      const domain = String(data.domain).trim();

      const existing = await this.model.findOne({
        where: {
          username,
          domain,
        },
      });

      if (existing) {
        console.log("Subscriber already exists:", existing.toJSON());
        return existing;
      }

      const newSubscriber = await this.model.create({
        ...data,
        username,
        domain
      });

      console.log("New Subscriber Added:", newSubscriber.toJSON());
      return newSubscriber;

    } catch (error) {
      console.error("Error adding subscriber:", error);
      throw error;
    }
  }
}

module.exports = SubscriberRepository;
