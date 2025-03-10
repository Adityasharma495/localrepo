const CrudRepository = require("./crud-repository");
const UserJourney = require("../c_db/User-Journey");
const User = require("../c_db/User");

class UserJourneyRepository extends CrudRepository {
  constructor() {
    super(UserJourney);
  }

  async getAll(current_uid, role) {
    try {
      let response;
      // If role is "Superadmin", fetch all user journeys
      if (role === "role_sadmin") {
        response = await UserJourney.findAll({
          include: [
            {
              model: User,
              as: "creator",
              attributes: ["id", "username"],
            },
          ],
          order: [["created_at", "DESC"]],
          raw: true,
        });
      } else {
        response = await UserJourney.findAll({
          where: { createdBy: current_uid },
          include: [
            {
              model: User,
              as: "creator",
              attributes: ["id", "username"],
            },
          ],
          order: [["created_at", "DESC"]],
          raw: true,
        });
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserJourneyRepository;
