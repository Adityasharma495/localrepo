const CrudRepository = require("./crud-repository");
const { User, VoicePlan } = require("../c_db");
const { constants } = require("../utils/common");

class VoicePlansRepository extends CrudRepository {
  constructor() {
    super(VoicePlan);
  }

  async getAll(current_role, current_uid) {
    try {
      let response;
      if (current_role === constants.USERS_ROLE.SUPER_ADMIN) {
        response = await VoicePlan.findAll({
          where: {
            plan_status: 1,
          },
          include: [
            {
              model: User,
              attributes: ["id", "username"],
              as: "user"
            },
          ],
          order: [["req_date", "DESC"]],
          raw: true,
          nest: true,
        });
      } else {
        response = await VoicePlan.findAll({
          where: {
            user_id: current_uid,
            plan_status: 1,
          },
          include: [
            {
              model: User,
              attributes: ["id", "username"],
              as: "user"
            },
          ],
          order: [["req_date", "DESC"]],
          raw: true,
          nest: true,
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await this.model.findOne({ where: {id: id} });

      if (!response) {
        const { AppError } = require("../utils/errors");
        const { StatusCodes } = require("http-status-codes");
        throw new AppError(
          "Not able to find the resource",
          StatusCodes.NOT_FOUND
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAllData() {
    let response = await this.model.findAll({ where: { plan_status: 1 } });
    response = response.map(item => {
      const createdAt = new Date(item.dataValues.created_at);
      const updatedAt = new Date(item.dataValues.updated_at);

      const formattedCreatedAt = createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const formattedUpdatedAt = updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      item.dataValues.created_at = formattedCreatedAt;
      item.dataValues.updated_at = formattedUpdatedAt;

      return item;
    });
    return response;
}

  async findOne(conditions) {
    try {
      const response = await this.model.findOne({
        where: { ...conditions },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VoicePlansRepository;
