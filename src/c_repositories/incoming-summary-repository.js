const CrudRepository = require("./crud-repository");
const { IncomingSummary, User } = require("../c_db");
const { Op } = require("sequelize");
const { constants } = require("../utils/common");

class IncomingSummaryRepository extends CrudRepository {
  constructor() {
    super(IncomingSummary);
  }

  async getAll(userRole, userId) {
    try {
      let response;
      if (userRole === constants.USERS_ROLE.SUPER_ADMIN) {
        response = await IncomingSummary.findAll({
          where: {},
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username"],
            },
            {
              model: User,
              as: "parent",
              attributes: ["id", "username"],
            },
            {
              model: User,
              as: "sParent",
              attributes: ["id", "username"],
            },
          ],
          raw: true,
          nest: true,
        });
      } else {
        response = await IncomingSummary.findAll({
          where: { user_id: userId },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username"],
            },
            {
              model: User,
              as: "parent",
              attributes: ["id", "username"],
            },
            {
              model: User,
              as: "sParent",
              attributes: ["id", "username"],
            },
          ],
          raw: true,
          nest: true,
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async isSummaryExist(userId, incomingDid, scheduleDate) {
    const startOfDay = new Date(scheduleDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(scheduleDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const response = await this.model.findOne({
        where: {
          did: incomingDid,
          user_id: userId,
          schedule_date: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay,
          },
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateSummary(data) {
    const startOfDay = new Date(data.schedule_date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(data.schedule_date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const [_, [updated]] = await this.model.update(data, {
        where: {
          user_id: data.user_id,
          did: data.did,
          schedule_date: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay,
          },
        },
        returning: true,
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = IncomingSummaryRepository;
