const CrudRepository = require("./crud-repository");
const { CallCenter } = require("../c_db");
const { constants } = require("../utils/common");

class CallCentreRepository extends CrudRepository {
  constructor() {
    super(CallCenter);
  }

  async getAll(userRole, createdById) {
    try {
      let response;
      if (userRole === constants.USERS_ROLE.SUPER_ADMIN) {
        response = await this.model.findAll({
          where: {},
          order: [["created_at", "DESC"]],
        });
      } else {
        response = await this.model.findAll({
          where: { created_by: createdById },
          order: [["created_at", "DESC"]],
        });
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAllData(role, id) {
    let response;
    if (role === constants.USERS_ROLE.SUPER_ADMIN) {
      response = await this.model.findAll();
    } else {
      response = await this.model.findAll({
        where: { created_by: id }
      });
    }
    return response;
  }
}

module.exports = CallCentreRepository;
