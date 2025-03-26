const CrudRepository = require("./crud-repository");
const NumberFile = require("../c_db/numbers-file-list");
const { Op } = require("sequelize");

class NumberFileListRepository extends CrudRepository {
  constructor() {
    super(NumberFile);
  }

  async getAll() {
    try {
      let response = await NumberFile.findAll({
        where: { is_deleted: false },
        include: [{
          model: require("../db/users"),
          as: "user",
          attributes: ["id", "username"],
        }],
        order: [["created_at", "DESC"]],
        raw: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NumberFileListRepository;
