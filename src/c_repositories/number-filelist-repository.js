const CrudRepository = require("./crud-repository");
const NumberFile = require("../c_db/numbers-file-list");
const {User} = require("../c_db")
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
          model: User,
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
