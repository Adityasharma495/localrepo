const CrudRepository = require("./crud-repository");
const { Call } = require("../c_db");
const { Op } = require("sequelize");

class CallsRepository extends CrudRepository {
  constructor() {
    super(Call);
  }

  async getAll(current_uid) {
    try {
      const response = await this.model.findAll({
        where: {
          is_deleted: false,
          created_by: current_uid
        },
        order: [['created_at', 'DESC']]
      });

      return response.map(r => r.toJSON());
    } catch (error) {
      throw error;
    }
  }

  // async update(id, data) {
  //   const response = await this.model.update(data, {
  //     where: { id, is_deleted: false },
  //     returning: true,
  //     plain: true
  //   });
  //   return response[1]; // updated instance
  // }

  // async get(id) {
  //   const response = await this.model.findOne({
  //     where: { id }
  //   });
  //   if (!response) {
  //     throw new Error("Call record not found");
  //   }
  //   return response.toJSON();
  // }

  // async delete(id) {
  //   const check = await this.model.findOne({
  //     where: { id, is_deleted: false }
  //   });
  //   if (!check) {
  //     const error = new Error("Call not found");
  //     error.name = "NotFound";
  //     throw error;
  //   }

  //   const response = await this.update(id, { is_deleted: true });
  //   return response;
  // }
}

module.exports = CallsRepository;
